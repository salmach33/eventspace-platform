import { createContext, useContext, useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { getSocket } from "../services/socket";
import { useAuth } from "./AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";

const NotifContext = createContext();

export const NotifProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const computeCounts = (notifs) => {
    setUnread(notifs.filter((n) => !n.read).length);
    setUnreadMessages(notifs.filter((n) => n.type === "nouveau_message" && !n.read).length);
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await API.get("/auth/notifications");
      setNotifications(data);
      computeCounts(data);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;

    socket.on("notification", (notif) => {
      setNotifications((prev) => {
        const updated = [notif, ...prev];
        computeCounts(updated);
        return updated;
      });
      toast(notif.message, { icon: <Bell className="w-4 h-4 text-teal-600" /> });
    });

    return () => socket.off("notification");
  }, [user]);

  const markRead = async () => {
    try {
      await API.put("/auth/notifications/read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
      setUnreadMessages(0);
    } catch {}
  };

  const markMessagesRead = () => {
    setNotifications((prev) =>
      prev.map((n) => n.type === "nouveau_message" ? { ...n, read: true } : n)
    );
    setUnreadMessages(0);
    setUnread((prev) => {
      const msgCount = notifications.filter((n) => n.type === "nouveau_message" && !n.read).length;
      return Math.max(0, prev - msgCount);
    });
  };

  return (
    <NotifContext.Provider value={{ notifications, unread, unreadMessages, markRead, markMessagesRead, fetchNotifications }}>
      {children}
    </NotifContext.Provider>
  );
};

export const useNotif = () => useContext(NotifContext);
