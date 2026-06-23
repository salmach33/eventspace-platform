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

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await API.get("/auth/notifications");
      setNotifications(data);
      setUnread(data.filter((n) => !n.read).length);
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
      setNotifications((prev) => [notif, ...prev]);
      setUnread((prev) => prev + 1);
      toast(notif.message, { icon: <Bell className="w-4 h-4 text-teal-600" /> });
    });

    return () => socket.off("notification");
  }, [user]);

  const markRead = async () => {
    try {
      await API.put("/auth/notifications/read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch {}
  };

  return (
    <NotifContext.Provider value={{ notifications, unread, markRead, fetchNotifications }}>
      {children}
    </NotifContext.Provider>
  );
};

export const useNotif = () => useContext(NotifContext);
