import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotif } from "../context/NotifContext";
import { useState } from "react";
import { mediaUrl } from "../utils/media";
import {
  Building2, Bell, MessageCircle, ShieldCheck, LayoutDashboard, User,
  Calendar, CheckCircle2, XCircle, Ban, CreditCard, Undo2,
} from "lucide-react";

const NOTIF_CONFIG = {
  nouvelle_reservation:  { Icon: Calendar, color: "text-teal-600" },
  reservation_accepted:  { Icon: CheckCircle2, color: "text-emerald-600" },
  reservation_refused:   { Icon: XCircle, color: "text-rose-600" },
  reservation_cancelled: { Icon: Ban, color: "text-gray-500" },
  nouveau_paiement:      { Icon: CreditCard, color: "text-teal-600" },
  paiement_confirme:     { Icon: CheckCircle2, color: "text-emerald-600" },
  paiement_cancelled:    { Icon: Ban, color: "text-gray-500" },
  paiement_rejected:     { Icon: XCircle, color: "text-rose-600" },
  paiement_refunded:     { Icon: Undo2, color: "text-blue-600" },
  espace_valide:         { Icon: CheckCircle2, color: "text-emerald-600" },
  espace_refuse:         { Icon: XCircle, color: "text-rose-600" },
  nouveau_message:       { Icon: MessageCircle, color: "text-teal-600" },
};

// Détermine la page à ouvrir quand on clique sur une notification
const getNotifLink = (notif) => {
  if (!notif.relatedId) return null;
  if (notif.type?.startsWith("reservation_") || notif.type?.startsWith("paiement_") || notif.type === "nouvelle_reservation" || notif.type === "nouveau_paiement") {
    return `/reservations/${notif.relatedId}`;
  }
  if (notif.type === "espace_valide" || notif.type === "espace_refuse") {
    return `/spaces/${notif.relatedId}`;
  }
  if (notif.type === "nouveau_message") {
    return "/messages";
  }
  return null;
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unread, unreadMessages, notifications, markRead } = useNotif();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleNotifs = () => {
    setShowNotifs(!showNotifs);
    if (!showNotifs) markRead();
  };

  const avatarSrc = mediaUrl(user?.avatar);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-teal-600">
          <Building2 className="w-7 h-7" /> EventSpace
        </Link>

        <div className="flex items-center gap-4">
          {user?.role !== "owner" && user?.role !== "admin" && (
            <Link to="/spaces" className="text-gray-600 hover:text-teal-600 font-medium">
              Espaces
            </Link>
          )}

          {user ? (
            <>
              {/* Notifications bell */}
              <div className="relative">
                <button onClick={toggleNotifs} className="relative p-2 rounded-full hover:bg-gray-100">
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </button>
                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b font-semibold text-gray-700">Notifications</div>
                    {notifications.length === 0 ? (
                      <p className="p-4 text-gray-400 text-sm text-center">Aucune notification</p>
                    ) : (
                      notifications.slice(0, 15).map((n, i) => {
                        const cfg = NOTIF_CONFIG[n.type] || { Icon: Bell, color: "text-gray-400" };
                        const link = getNotifLink(n);
                        const content = (
                          <div className="flex gap-3">
                            <cfg.Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                            <div>
                              <p className="text-gray-700">{n.message}</p>
                              <p className="text-gray-400 text-xs mt-1">
                                {new Date(n.createdAt).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                          </div>
                        );
                        const className = `p-3 border-b text-sm hover:bg-gray-50 ${!n.read ? "bg-teal-50" : ""} ${link ? "cursor-pointer" : ""}`;
                        return link ? (
                          <button
                            key={i}
                            onClick={() => { setShowNotifs(false); navigate(link); }}
                            className={`w-full text-left ${className}`}
                          >
                            {content}
                          </button>
                        ) : (
                          <div key={i} className={className}>{content}</div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Messages */}
              {user.role !== "admin" && (
                <Link to="/messages" className="relative p-2 rounded-full hover:bg-gray-100">
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                </Link>
              )}

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 bg-teal-50 px-3 py-2 rounded-full hover:bg-teal-100"
                >
                  {/* Avatar ou initiale */}
                  <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                    {user.role === "admin" ? (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-teal-600 hover:bg-teal-50 border-b" onClick={() => setShowMenu(false)}>
                        <ShieldCheck className="w-4 h-4" /> Dashboard Admin
                      </Link>
                    ) : (
                      <Link to="/dashboard" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowMenu(false)}>
                        <LayoutDashboard className="w-4 h-4" /> Tableau de bord
                      </Link>
                    )}
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-t" onClick={() => setShowMenu(false)}>
                      <User className="w-4 h-4" /> Mon Profil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 border-t"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="px-4 py-2 text-teal-600 border border-teal-600 rounded-lg hover:bg-teal-50 text-sm font-medium">
                Connexion
              </Link>
              <Link to="/register" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium">
                Inscription
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
