const axios = require("axios");

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "mistral";

console.log(`[Ollama Config] URL: ${OLLAMA_URL}, Model: ${OLLAMA_MODEL}`);

async function callOllama(prompt) {
  try {
    console.log(`[Ollama] Envoi prompt au modèle ${OLLAMA_MODEL}...`);
    
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
    }, {
      timeout: 120000, // 2 minutes timeout
    });

    const text = response.data.response || "";
    console.log(`[Ollama] Réponse reçue: ${text.substring(0, 50)}...`);
    
    return text.trim();
  } catch (error) {
    console.error(`[Ollama Error] ${error.message}`);
    throw new Error(`Erreur Ollama: ${error.message}`);
  }
}

module.exports = { callOllama };