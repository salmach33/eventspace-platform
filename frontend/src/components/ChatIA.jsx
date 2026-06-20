import { useState, useRef, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import "./ChatIA.css";

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
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chat-floating-btn"
          title="Ouvrir le chat IA"
        >
          🤖
        </button>
      )}

      {isOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <div>
              <h3>Chat IA EventSpace</h3>
              <p>Posez vos questions, je réponds intelligemment</p>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                clearMessages();
              }}
              className="btn-action"
            >
              ✕
            </button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-welcome">
                <h4>Bienvenue au Chat IA EventSpace</h4>
                <p>Je peux vous aider à:</p>
                <ul>
                  <li>Recommander des salles selon vos besoins</li>
                  <li>Donner des conseils pour organiser votre événement</li>
                  <li>Résumer les avis des salles</li>
                  <li>Décrire des espaces</li>
                </ul>
                <p className="mt-3 text-xs">Exemples de questions:</p>
                <div className="examples">
                  {quickExamples.map((example, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(example);
                      }}
                      className="example-btn"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`message message-${msg.sender}`}>
                  <p>{msg.text}</p>
                </div>
              ))
            )}
            {loading && (
              <div className="message message-bot">
                <p>Chargement...</p>
              </div>
            )}
            {error && (
              <div className="message message-error">
                <p>Erreur: {error}</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez une question..."
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? "..." : "Envoyer"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}