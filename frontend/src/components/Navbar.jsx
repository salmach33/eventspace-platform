import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotif } from "../context/NotifContext";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unread, notifications, markRead } = useNotif();
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

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          🏛️ EventSpace
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/spaces" className="text-gray-600 hover:text-indigo-600 font-medium">
            Espaces
          </Link>

          {user ? (
            <>
              {/* Notifications bell */}
              <div className="relative">
                <button onClick={toggleNotifs} className="relative p-2 rounded-full hover:bg-gray-100">
                  <span className="text-xl">🔔</span>
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
                      notifications.slice(0, 15).map((n, i) => (
                        <div key={i} className={`p-3 border-b text-sm hover:bg-gray-50 ${!n.read ? "bg-indigo-50" : ""}`}>
                          <p className="text-gray-700">{n.message}</p>
                          <p className="text-gray-400 text-xs mt-1">
                            {new Date(n.createdAt).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Messages */}
              <Link to="/messages" className="p-2 rounded-full hover:bg-gray-100 text-xl">
                💬
              </Link>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 bg-indigo-50 px-3 py-2 rounded-full hover:bg-indigo-100"
                >
                  <span className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                    {user.role === "admin" ? (
                      <Link to="/admin" className="block px-4 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 border-b" onClick={() => setShowMenu(false)}>
                        🛡️ Dashboard Admin
                      </Link>
                    ) : (
                      <>
                        <Link to="/dashboard" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowMenu(false)}>
                          Tableau de bord
                        </Link>
                        {user.role === "owner" && (
                          <Link to="/my-spaces" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowMenu(false)}>
                            Mes Espaces
                          </Link>
                        )}
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 text-sm font-medium">
                Connexion
              </Link>
              <Link to="/register" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                Inscription
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
