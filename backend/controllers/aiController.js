const { callOllama } = require("../utils/ollamaClient");
const Space = require("../models/Space");
const Reservation = require("../models/Reservation");

const MAX_MESSAGE_LENGTH = 500;
const CACHE_DURATION_MS = 10 * 60 * 1000;

// Cache simple des salles
let spacesCache = null;
let lastCacheTime = 0;


const GREETING_KEYWORDS = [
  "bonjour", "bonsoir", "salut", "hello", "hi", "coucou", "hey",
  "salam", "marhba", "ahlan",
];

const PRESENTATION = `Bonjour et bienvenue sur **EventSpace** !

Je suis votre assistant IA. Voici ce que je peux faire pour vous :

**Trouver une salle** — Dites-moi votre type d'événement, le nombre de personnes ou votre budget et je vous recommande les meilleurs espaces.

**Vérifier les disponibilités** — Mentionnez une date (ex. "le 15 juillet") et je filtre les salles libres ce jour-là.

**Conseils d'organisation** — Posez-moi vos questions sur l'organisation de mariages, conférences, anniversaires, soirées...

**Types d'espaces disponibles** : Mariage · Conférence · Anniversaire · Fiançailles · Soirée / Gala · Séminaire · Événement

Comment puis-je vous aider aujourd'hui ?`;

const REQUEST_KEYWORDS = {
  planning: ["comment", "conseil", "organisation", "organiser"],
  recommendation: [
    "recommand", "quelle salle", "salle pour", "reserver",
    "mariage", "personnes", "budget", "capacite", "disponible",
  ],
  reviews: ["avis", "resume"],
  description: ["description", "decrire"],
};

const TYPE_KEYWORDS = {
  mariage: ["mariage"],
  conference: ["conference"],
  evenement: ["evenement", "event"],
  anniversaire: ["anniversaire", "birthday"],
  fiancailles: ["fiancailles", "fiançailles", "bague", "fiancer"],
  soiree: ["soiree", "soirée", "gala", "cocktail"],
  seminaire: ["seminaire", "seminaire", "formation"],
};

const MONTHS_FR = {
  janvier: 0, fevrier: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, aout: 7, septembre: 8, octobre: 9, novembre: 10, decembre: 11,
};

const COMBINING_DIACRITIC_RANGE = [0x0300, 0x036f];

function removeAccents(str) {
  return Array.from(str.normalize("NFD"))
    .filter((ch) => {
      const code = ch.codePointAt(0);
      return code < COMBINING_DIACRITIC_RANGE[0] || code > COMBINING_DIACRITIC_RANGE[1];
    })
    .join("");
}

function extractSpaceType(message) {
  const msg = removeAccents(message.toLowerCase());

  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
    if (keywords.some((kw) => msg.includes(kw))) {
      return type;
    }
  }

  return null;
}

function extractDate(message) {
  const msg = message.toLowerCase();

  const textMatch = msg.match(
    /(\d{1,2})\s*(janvier|f[ée]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[ée]cembre)(?:\s+(\d{4}))?/
  );
  if (textMatch) {
    const day = parseInt(textMatch[1], 10);
    const month = MONTHS_FR[removeAccents(textMatch[2])];
    const year = textMatch[3] ? parseInt(textMatch[3], 10) : new Date().getFullYear();
    return new Date(year, month, day);
  }

  const numericMatch = msg.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (numericMatch) {
    const [day, month, year] = numericMatch.slice(1).map(Number);
    return new Date(year, month - 1, day);
  }

  return null;
}

async function filterAvailableOnDate(spaces, date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const bookedReservations = await Reservation.find({
    space: { $in: spaces.map((s) => s._id) },
    status: { $in: ["pending", "accepted"] },
    date: { $gte: dayStart, $lt: dayEnd },
  }).select("space");

  const bookedSpaceIds = new Set(bookedReservations.map((r) => r.space.toString()));

  return spaces.filter((s) => {
    if (bookedSpaceIds.has(s._id.toString())) return false;

    const blockedManually = s.availability?.some(
      (a) => new Date(a.date).getTime() === dayStart.getTime() && a.isAvailable === false
    );
    return !blockedManually;
  });
}

function isGreeting(message) {
  const msg = removeAccents(message.toLowerCase()).trim();
  return GREETING_KEYWORDS.some((kw) => msg === kw || msg.startsWith(kw + " ") || msg.startsWith(kw + ",") || msg.startsWith(kw + "!"));
}

function detectRequestType(message) {
  const msg = removeAccents(message.toLowerCase());

  for (const [type, keywords] of Object.entries(REQUEST_KEYWORDS)) {
    if (keywords.some((kw) => msg.includes(kw))) {
      return type;
    }
  }

  return "general";
}

async function getSpacesFromCache() {
  const now = Date.now();

  if (spacesCache && now - lastCacheTime < CACHE_DURATION_MS) {
    return spacesCache;
  }

  try {
    const spaces = await Space.find({ isValidated: true, isActive: true })
      .select("title type capacity price location equipements availability")
      .limit(10);

    spacesCache = spaces;
    lastCacheTime = now;
    return spaces;
  } catch (error) {
    console.error("[Cache Error]:", error.message);
    return spacesCache || [];
  }
}

function formatSpace(space) {
  const city = space.location?.city || "lieu non precise";
  const equipements = space.equipements?.length ? ` - ${space.equipements.join(", ")}` : "";
  return `${space.title} (type: ${space.type}): ${space.capacity} personnes, ${space.price} DH, ${city}${equipements}`;
}

async function getRecommendationsWithData(message) {
  try {
    let spaces = await getSpacesFromCache();

    if (spaces.length === 0) {
      return "Aucune salle disponible dans la base de données.";
    }

    const requestedType = extractSpaceType(message);
    if (requestedType) {
      
      spaces = spaces.filter((s) => s.type === requestedType);
    }

    const requestedDate = extractDate(message);
    if (requestedDate) {
      spaces = await filterAvailableOnDate(spaces, requestedDate);
    }

    if (spaces.length === 0) {
      return "Aucune salle ne correspond à ces critères (type ou disponibilité à cette date).";
    }

    const spacesInfo = spaces.map(formatSpace).join("\n");
    const dateNote = requestedDate
      ? `\nToutes les salles listées ci-dessous sont vérifiées disponibles le ${requestedDate.toLocaleDateString("fr-FR")}.`
      : "";

    const prompt = `Tu es un expert en location de salles d'événements.

Demande utilisateur: ${message}

Salles disponibles correspondant aux critères:
${spacesInfo}${dateNote}

Recommande uniquement les salles de cette liste qui correspondent à la demande. Mentionne le nom exact de chaque salle recommandée. Ne recommande jamais une salle absente de cette liste.`;

    return await callOllama(prompt);
  } catch (error) {
    console.error("[Recommendation Error]:", error.message);
    return "Erreur lors de la recherche de salles.";
  }
}

function generatePrompt(message, type) {
  switch (type) {
    case "planning":
      return `Tu es un expert en organisation d'événements. Question: ${message}. Donne des conseils pratiques.`;
    case "description":
      return `Décris une salle: ${message}`;
    default:
      return message;
  }
}

async function findSpaceByName(message) {
  const msg = removeAccents(message.toLowerCase());
  const spaces = await getSpacesFromCache();
  return spaces.find((s) => msg.includes(removeAccents(s.title.toLowerCase())));
}

async function getReviewsSummary(message) {
  try {
    const matchedSpace = await findSpaceByName(message);
    if (!matchedSpace) {
      return "Je n'ai trouvé aucune salle correspondant à ce nom. Pouvez-vous préciser le nom exact de la salle ?";
    }

    const space = await Space.findById(matchedSpace._id).select("title reviews averageRating");
    if (!space.reviews || space.reviews.length === 0) {
      return `La salle "${space.title}" n'a pas encore reçu d'avis.`;
    }

    const reviewsText = space.reviews
      .map((r) => `- Note ${r.rating}/5 : "${r.comment}"`)
      .join("\n");

    const prompt = `Voici les avis clients pour la salle "${space.title}" (note moyenne ${space.averageRating}/5) :
${reviewsText}

Résume ces avis en 3-4 phrases, en dégageant les points positifs et négatifs récurrents.`;

    return await callOllama(prompt);
  } catch (error) {
    console.error("[Reviews Error]:", error.message);
    return "Erreur lors de la récupération des avis.";
  }
}

exports.chat = async (req, res) => {
  try {
    const message = (req.body.message || "").trim();

    if (!message) {
      return res.status(400).json({ success: false, error: "Message vide" });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        success: false,
        error: `Message trop long (max ${MAX_MESSAGE_LENGTH} caractères)`,
      });
    }

    // Salutation → présentation instantanée sans appel Ollama
    if (isGreeting(message)) {
      return res.json({ success: true, response: PRESENTATION, type: "greeting" });
    }

    const type = detectRequestType(message);
    console.log(`[Chat] Type: ${type} | Message: ${message}`);

    const response =
      type === "recommendation"
        ? await getRecommendationsWithData(message)
        : type === "reviews"
        ? await getReviewsSummary(message)
        : await callOllama(generatePrompt(message, type));

    res.json({ success: true, response, type });
  } catch (error) {
    console.error("[Chat Error]:", error.message);
    res.status(500).json({
      success: false,
      error: "Le service IA est momentanément indisponible. Réessayez plus tard.",
    });
  }
};
