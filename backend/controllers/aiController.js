const { callOllama } = require("../utils/ollamaClient");

// UN SEUL ENDPOINT - détecte le type de demande et répond intelligemment
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        error: "Message vide" 
      });
    }

    console.log(`[Chat] Reçu: ${message}`);
    
    // Détecte le type de demande
    const type = detectRequestType(message);
    console.log(`[Chat] Type détecté: ${type}`);
    
    let prompt = generatePrompt(message, type);
    const response = await callOllama(prompt);
    
    res.json({ 
      success: true, 
      response: response,
      type: type,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[Chat Error]:", error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Détecte le type de demande basé sur les mots-clés
function detectRequestType(message) {
  const msg = message.toLowerCase();
  
  // Recommandations de salles
  if (msg.includes("recommand") || msg.includes("quelle salle") || 
      msg.includes("salle pour") || msg.includes("quel type de salle") ||
      msg.includes("réserver") || msg.includes("mariage") || 
      msg.includes("conférence") || msg.includes("anniversaire") ||
      msg.includes("personnes") || msg.includes("budget") ||
      msg.includes("événement") || msg.includes("réception")) {
    return "recommendation";
  }
  
  // Aide organisation événement
  if (msg.includes("comment") || msg.includes("conseil") || 
      msg.includes("organisation") || msg.includes("organiser") ||
      msg.includes("étapes") || msg.includes("tips") ||
      msg.includes("aide") || msg.includes("astuce")) {
    return "planning";
  }
  
  // Résumé/analyse d'avis
  if (msg.includes("avis") || msg.includes("résumé") || 
      msg.includes("note") || msg.includes("commentaires") ||
      msg.includes("feedback") || msg.includes("opinion")) {
    return "reviews";
  }
  
  // Description d'espace
  if (msg.includes("description") || msg.includes("présentation") ||
      msg.includes("décrire") || msg.includes("caractéristiques")) {
    return "description";
  }
  
  // Chat général par défaut
  return "general";
}

// Génère le prompt intelligent selon le type
function generatePrompt(message, type) {
  switch (type) {
    case "recommendation":
      return `Tu es un expert en location de salles d'événements avec 15 ans d'expérience.

L'utilisateur demande: "${message}"

Recommande les TYPES de salles qui conviendraient. Pour chaque type:
- Explique pourquoi c'est approprié
- Mentionne les critères importants (taille, équipements, etc)
- Donne les erreurs à éviter

Sois concis et pratique (100-150 mots).`;

    case "planning":
      return `Tu es un consultant expert en organisation d'événements avec 15 ans d'expérience.

Question: "${message}"

Donne:
- Des conseils pratiques et professionnels
- Des étapes concrètes
- Des astuces utiles
- Les erreurs à éviter

Sois concis (100-150 mots).`;

    case "reviews":
      return `Tu es un analyste de données spécialisé dans les avis clients.

L'utilisateur demande: "${message}"

Résume les avis en identifiant:
- Les points forts principaux
- Les domaines à améliorer
- Les recommandations clés

Sois concis (80-120 mots).`;

    case "description":
      return `Tu es un expert en marketing pour salles d'événements.

Demande: "${message}"

Génère une description professionnelle et attrayante qui mentionne:
- Les points forts
- Les équipements clés
- L'ambiance générale
- Qui devrait choisir

Sois concis (80-120 mots).`;

    default:
      return `Tu es un assistant utile pour les salles d'événements.

L'utilisateur dit: "${message}"

Réponds de manière amicale, concise et pertinente.`;
  }
}