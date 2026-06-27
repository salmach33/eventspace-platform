const API_URL = import.meta.env.DEV ? "http://localhost:5000/api/ai" : "/api/ai";

export const chatAPI = {
  sendMessage: async (message) => {
    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Erreur réseau");
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error);
    }

    return data.response;
  },
};