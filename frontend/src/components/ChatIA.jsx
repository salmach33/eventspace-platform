import { useState, useRef, useEffect } from "react";
import { Bot, X, Minus } from "lucide-react";
import { useChat } from "../hooks/useChat";

function renderMarkdown(text) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/\*\*(.+?)\*\*/g);
    return (
      <span key={i}>
        {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
        {"\n"}
      </span>
    );
  });
}

export default function ChatIA() {
  const { messages, loading, error, sendMessage, clearMessages } = useChat();
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const minimize = () => setIsOpen(false); // garde les messages
  const close = () => { setIsOpen(false); clearMessages(); };

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
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-teal-700 to-teal-500 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-50"
          title="Ouvrir le chat IA"
        >
          <Bot className="w-6 h-6" />
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {messages.length > 9 ? "9+" : messages.length}
            </span>
          )}
        </button>
      )}

      {/* Fenêtre du chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 z-50">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-teal-700 to-teal-500 text-white p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">Chat IA EventSpace</h3>
              <p className="text-sm text-teal-100">
                {messages.length > 0 ? `${messages.length} message${messages.length > 1 ? "s" : ""}` : "Répondez intelligemment"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {/* Réduire — garde la conversation */}
              <button
                onClick={minimize}
                className="text-white hover:bg-teal-600 rounded-full p-2 transition"
                title="Réduire"
              >
                <Minus className="w-5 h-5" />
              </button>
              {/* Fermer — efface la conversation */}
              <button
                onClick={close}
                className="text-white hover:bg-teal-600 rounded-full p-2 transition"
                title="Fermer et effacer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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
                      className="text-xs bg-white border border-teal-200 text-teal-700 p-2 rounded hover:bg-teal-50 transition truncate"
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
                        ? "bg-teal-600 text-white rounded-br-none"
                        : msg.sender === "error"
                        ? "bg-red-100 text-red-700 rounded-bl-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {msg.sender === "bot" ? renderMarkdown(msg.text) : msg.text}
                    </p>
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
              maxLength={500}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition font-medium"
            >
              {loading ? "..." : "Envoyer"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}