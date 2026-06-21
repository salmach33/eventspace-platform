const axios = require("axios");

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "mistral";

console.log(`[Ollama Config] URL: ${OLLAMA_URL}, Model: ${OLLAMA_MODEL}`);

async function callOllama(prompt) {
  try {
    console.log(`[Ollama] Envoi prompt au modèle: ${OLLAMA_MODEL}`);
    console.log(`[Ollama] Prompt length: ${prompt.length}`);
    
    // Test de connexion d'abord
    try {
      await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
      console.log(`[Ollama] Connexion OK`);
    } catch (err) {
      throw new Error(`Ollama ne répond pas. Vérifiez: ollama serve`);
    }

    const startTime = Date.now();
    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
      },
      {
        timeout: 300000, // 5 minutes au lieu de 2
      }
    );

    const duration = Date.now() - startTime;
    console.log(`[Ollama] Réponse reçue en ${duration}ms`);

    const text = response.data.response || "";
    return text.trim();
  } catch (error) {
    console.error(`[Ollama Error] ${error.message}`);
    
    // Fallback si Ollama est lent ou ne répond pas
    if (error.message.includes("timeout") || error.code === "ECONNREFUSED") {
      return "Je suis désolé, Ollama met trop de temps. Vérifiez qu'Ollama est lancé avec 'ollama serve' dans un terminal.";
    }
    
    throw new Error(`Erreur Ollama: ${error.message}`);
  }
}

module.exports = { callOllama };