const { callOllama } = require("../utils/ollamaClient");
const Space = require("../models/Space");

function detectRequestType(message) {
  const msg = message.toLowerCase();
  
  if (msg.includes("recommand") || msg.includes("quelle salle") || 
      msg.includes("salle pour") || msg.includes("réserver") ||
      msg.includes("mariage") || msg.includes("personnes") || msg.includes("budget") ||
      msg.includes("capacite") || msg.includes("disponible") || msg.includes("prix")) {
    return "recommendation";
  }
  
  if (msg.includes("comment") || msg.includes("conseil") || 
      msg.includes("organisation") || msg.includes("organiser")) {
    return "planning";
  }
  
  if (msg.includes("avis") || msg.includes("résumé") || msg.includes("feedback")) {
    return "reviews";
  }
  
  if (msg.includes("description") || msg.includes("décrire")) {
    return "description";
  }
  
  return "general";
}

async function getRecommendationsWithData(message) {
  try {
    // Récupère TOUTES les salles de la base de données
    const spaces = await Space.find().limit(20);
    
    if (spaces.length === 0) {
      return "Je n'ai pas trouvé de salles dans la base de données.";
    }

    // Formate les salles pour Ollama
    const spacesInfo = spaces.map(space => 
      `- ${space.title}: ${space.capacity} personnes, ${space.price}€/jour, ${space.location}, ${space.amenities?.join(", ") || "N/A"}`
    ).join("\n");

    console.log(`[Recommendation] ${spaces.length} salles trouvées`);

    // Envoie le contexte réel à Ollama
    const prompt = `Tu es un expert en location de salles d'événements.

L'utilisateur demande: "${message}"

Voici les salles DISPONIBLES dans notre catalogue:
${spacesInfo}

Recommande les MEILLEURES salles de cette liste qui correspondent à sa demande.
Mentionne:
- Le nom exact de la salle
- Pourquoi elle convient
- Le prix et la capacité

Réponds en te basant UNIQUEMENT sur les salles listées ci-dessus.`;

    const response = await callOllama(prompt);
    return response;
  } catch (error) {
    console.error("[Recommendation Error]:", error.message);
    return `Erreur lors de la recherche de salles: ${error.message}`;
  }
}

function generatePrompt(message, type) {
  switch (type) {
    case "planning":
      return `Conseils organisation: ${message}`;
    case "reviews":
      return `Résume avis: ${message}`;
    case "description":
      return `Description salle: ${message}`;
    default:
      return message;
  }
}

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim() === "") {
      return res.status(400).json({ success: false, error: "Message vide" });
    }

    console.log(`[Chat] Message reçu: ${message}`);
    const type = detectRequestType(message);
    console.log(`[Chat] Type détecté: ${type}`);
    
    let response;

    // Si c'est une recommandation, récupère les données réelles
    if (type === "recommendation") {
      response = await getRecommendationsWithData(message);
    } else {
      // Pour les autres types, utilise les prompts simples
      const prompt = generatePrompt(message, type);
      response = await callOllama(prompt);
    }
    
    res.json({ success: true, response, type });
  } catch (error) {
    console.error("[Chat Error]:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};