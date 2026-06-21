import { useState, useRef, useEffect } from "react";
import { useChat } from "../hooks/useChat";

export default function ChatIA() {
  const { messages, loading, error, sendMessage, clearMessages } = useChat();
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    await sendMessage(userMessage);
  };

  const quickExamples = [
    "Quelle salle pour un mariage de 100 personnes?",
    "Comment organiser un cocktail?",
    "Résume les avis de cette salle",
    "Décris une salle moderne"
  ];

  return (
    <>
      {/* Bouton flottant */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center text-2xl font-bold z-50"
          title="Ouvrir le chat IA"
        >
          🤖
        </button>
      )}

      {/* Fenêtre du chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 z-50">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">Chat IA EventSpace</h3>
              <p className="text-sm text-purple-100">Répondez intelligemment</p>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                clearMessages();
              }}
              className="text-white hover:bg-purple-700 rounded-full p-2 transition"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <h4 className="font-bold text-gray-700 mb-2">Bienvenue au Chat IA</h4>
                <p className="text-sm text-gray-600 mb-4">Je peux vous aider à:</p>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  <li>Recommander des salles</li>
                  <li>Organiser votre événement</li>
                  <li>Résumer les avis</li>
                  <li>Décrire des espaces</li>
                </ul>
                <p className="text-xs text-gray-500 mb-2">Exemples:</p>
                <div className="grid grid-cols-1 gap-2 w-full">
                  {quickExamples.map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(example)}
                      className="text-xs bg-white border border-purple-200 text-purple-700 p-2 rounded hover:bg-purple-50 transition truncate"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      msg.sender === "user"
                        ? "bg-purple-600 text-white rounded-br-none"
                        : msg.sender === "error"
                        ? "bg-red-100 text-red-700 rounded-bl-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 p-3 rounded-lg rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSendMessage} className="p-4 border-t bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez une question..."
              disabled={loading}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition font-medium"
            >
              {loading ? "..." : "Envoyer"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}