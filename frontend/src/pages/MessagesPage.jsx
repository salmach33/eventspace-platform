import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, MessageCircle, Building2, ArrowRight, Hand } from "lucide-react";
import API from "../services/api";
import { getSocket } from "../services/socket";
import { useAuth } from "../context/AuthContext";

export default function MessagesPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const spaceId = searchParams.get("spaceId");
  const partnerId = searchParams.get("ownerId") || searchParams.get("clientId");

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [convLoading, setConvLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [search, setSearch] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const activeConvRef = useRef(null);

  const socket = getSocket();

  // Sync ref with state for use in socket callbacks
  useEffect(() => { activeConvRef.current = activeConv; }, [activeConv]);

  // Load conversations
  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await API.get("/messages/conversations");
      setConversations(data);
    } catch {} finally {
      setConvLoading(false);
    }
  }, []);

  useEffect(() => { fetchConversations(); }, []);

  // Auto-open conversation from URL params
  useEffect(() => {
    if (spaceId && partnerId) loadMessages(spaceId, partnerId);
  }, [spaceId, partnerId]);

  const loadMessages = async (sId, pId, partner = null) => {
    setMsgLoading(true);
    try {
      const { data } = await API.get(`/messages/${sId}/${pId}`);
      setMessages(data);
      setActiveConv({ spaceId: sId, partnerId: pId });
      setPartnerInfo(partner);
      fetchConversations(); // refresh unread counts
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch {} finally {
      setMsgLoading(false);
    }
  };

  // Socket: receive messages + typing
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      const conv = activeConvRef.current;
      const spaceMatch = msg.space === conv?.spaceId || msg.space?._id === conv?.spaceId;
      const partnerMatch =
        msg.sender?._id === conv?.partnerId ||
        msg.sender === conv?.partnerId ||
        msg.receiver?._id === conv?.partnerId ||
        msg.receiver === conv?.partnerId;

      if (conv && spaceMatch && partnerMatch) {
        setMessages((prev) => {
          if (prev.find((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
      // Refresh conversation list to update last message + unread
      fetchConversations();
    };

    const handleTyping = ({ senderId }) => {
      if (senderId === activeConvRef.current?.partnerId) setIsTyping(true);
    };
    const handleStopTyping = ({ senderId }) => {
      if (senderId === activeConvRef.current?.partnerId) setIsTyping(false);
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("userTyping", handleTyping);
    socket.on("userStopTyping", handleStopTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("userTyping", handleTyping);
      socket.off("userStopTyping", handleStopTyping);
    };
  }, [socket]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeConv || !socket) return;
    socket.emit("sendMessage", {
      spaceId: activeConv.spaceId,
      receiverId: activeConv.partnerId,
      content: input.trim(),
    });
    socket.emit("stopTyping", { receiverId: activeConv.partnerId, spaceId: activeConv.spaceId });
    setInput("");
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!socket || !activeConv) return;
    socket.emit("typing", { receiverId: activeConv.partnerId, spaceId: activeConv.spaceId });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { receiverId: activeConv.partnerId, spaceId: activeConv.spaceId });
    }, 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) handleSend(e);
  };

  // Helpers
  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
    if (d.toDateString() === yesterday.toDateString()) return "Hier";
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = formatDate(msg.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  // Filter conversations by search
  const filteredConvs = conversations.filter((conv) => {
    const name = conv._id?.partner?.name?.toLowerCase() || "";
    const title = conv._id?.space?.title?.toLowerCase() || "";
    return name.includes(search.toLowerCase()) || title.includes(search.toLowerCase());
  });

  // Get active partner info from conversations
  const activePartner = partnerInfo ||
    conversations.find(
      (c) => c._id?.space?._id === activeConv?.spaceId && c._id?.partner?._id === activeConv?.partnerId
    )?._id?.partner;

  const activeSpace = conversations.find(
    (c) => c._id?.space?._id === activeConv?.spaceId && c._id?.partner?._id === activeConv?.partnerId
  )?._id?.space;

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <div className="h-[calc(100vh-64px)] flex bg-gray-100">

      {/* ── SIDEBAR ── */}
      <div className="w-80 bg-white flex flex-col border-r border-gray-200 flex-shrink-0">

        {/* Header sidebar */}
        <div className="px-4 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">Messages</h2>
            {totalUnread > 0 && (
              <span className="bg-teal-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                {totalUnread}
              </span>
            )}
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {convLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageCircle className="w-9 h-9 mx-auto mb-2 text-gray-300" />
              <p className="text-gray-400 text-sm">
                {search ? "Aucun résultat" : "Aucune conversation"}
              </p>
              {!search && (
                <p className="text-gray-300 text-xs mt-1">
                  Contactez un propriétaire depuis une fiche espace
                </p>
              )}
            </div>
          ) : (
            filteredConvs.map((conv, i) => {
              const partner = conv._id?.partner;
              const space = conv._id?.space;
              const lastMsg = conv.lastMessage;
              const isActive =
                activeConv?.spaceId === space?._id &&
                activeConv?.partnerId === partner?._id;
              const hasUnread = conv.unreadCount > 0;

              return (
                <button
                  key={i}
                  onClick={() => loadMessages(space?._id, partner?._id, partner)}
                  className={`w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    isActive ? "bg-teal-50 border-l-4 border-l-teal-500" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                        isActive ? "bg-teal-600" : "bg-gray-400"
                      }`}>
                        {partner?.name?.charAt(0).toUpperCase()}
                      </div>
                      {hasUnread && (
                        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-teal-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${hasUnread ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                          {partner?.name}
                        </p>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-1">
                          {lastMsg?.createdAt ? formatTime(lastMsg.createdAt) : ""}
                        </span>
                      </div>
                      <p className="text-xs text-teal-500 truncate">{space?.title}</p>
                      <p className={`text-xs truncate mt-0.5 ${hasUnread ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                        {lastMsg?.content || "Démarrer la conversation"}
                      </p>
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="bg-teal-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── CHAT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-xl font-semibold text-gray-600">Vos messages</p>
            <p className="text-sm mt-1 text-gray-400">Sélectionnez une conversation pour commencer</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-gray-200 px-5 py-3.5 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                {activePartner?.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800">{activePartner?.name || "Conversation"}</p>
                {activeSpace && (
                  <p className="flex items-center gap-1 text-xs text-teal-500 truncate">
                    <Building2 className="w-3 h-3" /> {activeSpace.title}
                  </p>
                )}
              </div>
              {activeSpace && (
                <Link
                  to={`/spaces/${activeConv.spaceId}`}
                  className="flex items-center gap-1 text-xs text-teal-600 border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition flex-shrink-0"
                >
                  Voir l'espace <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1" style={{ background: "#f0f2f5" }}>
              {msgLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Hand className="w-9 h-9 mb-2 text-gray-300" />
                  <p className="text-sm">Envoyez le premier message !</p>
                </div>
              ) : (
                Object.entries(groupedMessages).map(([date, msgs]) => (
                  <div key={date}>
                    {/* Date separator */}
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-gray-300" />
                      <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full font-medium">
                        {date}
                      </span>
                      <div className="flex-1 h-px bg-gray-300" />
                    </div>

                    {msgs.map((msg, i) => {
                      const isMine = msg.sender?._id === user._id || msg.sender === user._id;
                      const prevMsg = msgs[i - 1];
                      const prevSame = prevMsg && (prevMsg.sender?._id === msg.sender?._id || prevMsg.sender === msg.sender);
                      const showAvatar = !isMine && !prevSame;

                      return (
                        <div
                          key={msg._id || i}
                          className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"} ${prevSame ? "mt-0.5" : "mt-3"}`}
                        >
                          {/* Avatar for partner */}
                          {!isMine && (
                            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white ${showAvatar ? "bg-gray-400" : "opacity-0"}`}>
                              {msg.sender?.name?.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} max-w-xs md:max-w-md lg:max-w-lg`}>
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isMine
                                ? "bg-teal-600 text-white rounded-br-sm"
                                : "bg-white text-gray-800 shadow-sm rounded-bl-sm"
                            }`}>
                              {msg.content}
                            </div>
                            {/* Time - only show for last in group */}
                            {(!msgs[i + 1] || (msgs[i + 1]?.sender?._id !== msg.sender?._id && msgs[i + 1]?.sender !== msg.sender)) && (
                              <span className={`text-xs mt-1 px-1 ${isMine ? "text-gray-400" : "text-gray-400"}`}>
                                {formatTime(msg.createdAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-end gap-2 mt-3">
                  <div className="w-7 h-7 rounded-full bg-gray-400 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">
                    {activePartner?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="bg-white border-t border-gray-200 px-4 py-3">
              <div className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleTyping}
                  onKeyDown={handleKeyDown}
                  placeholder="Écrire un message... (Entrée pour envoyer)"
                  className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex-shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
