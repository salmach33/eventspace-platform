import { useState, useCallback } from "react";
import { chatAPI } from "../services/chatAPI";

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // Ajoute le message utilisateur
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: userMessage, sender: "user" },
      ]);

      // Appel au backend
      const response = await chatAPI.sendMessage(userMessage);

      // Ajoute la réponse IA
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: response, sender: "bot" },
      ]);

      return response;
    } catch (err) {
      const errorMsg = err.message || "Erreur de connexion";
      setError(errorMsg);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: `Erreur: ${errorMsg}`, sender: "error" },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages,
  };
}