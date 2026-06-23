const axios = require("axios");

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "mistral";
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS) || 180000;

console.log(`[Ollama] URL: ${OLLAMA_URL}, Model: ${OLLAMA_MODEL}`);

async function callOllama(prompt) {
  const startTime = Date.now();

  try {
    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        keep_alive: "30m", // évite de recharger le modèle en mémoire à chaque requête (~15s de pénalité en CPU)
        options: {
          num_predict: 350, // bride la longueur de réponse pour rester sous le timeout en inférence CPU
        },
      },
      {
        timeout: OLLAMA_TIMEOUT_MS,
      }
    );

    console.log(`[Ollama] Réponse en ${Date.now() - startTime}ms`);

    const text = response.data?.response?.trim() || "";
    return text || "Désolé, je n'ai pas pu générer de réponse. Reformulez votre question.";
  } catch (error) {
    console.error(`[Ollama Error] ${error.message}`);

    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      return "Réponse trop lente. Réessayez dans quelques secondes.";
    }

    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      return "Le service IA est momentanément indisponible. Réessayez plus tard.";
    }

    throw new Error(`Erreur Ollama: ${error.message}`);
  }
}

function warmUp() {
  axios
    .post(
      `${OLLAMA_URL}/api/generate`,
      { model: OLLAMA_MODEL, prompt: "Bonjour", stream: false, keep_alive: "30m" },
      { timeout: OLLAMA_TIMEOUT_MS }
    )
    .then(() => console.log("[Ollama] Modèle préchargé en mémoire"))
    .catch((error) => console.error(`[Ollama] Préchauffage échoué: ${error.message}`));
}

module.exports = { callOllama, warmUp };