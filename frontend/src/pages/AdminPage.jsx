import { useState, useEffect } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const TABS = [
  { id: "spaces", label: "Espaces à valider", icon: "🏛️" },
  { id: "all-spaces", label: "Tous les espaces", icon: "📋" },
  { id: "users", label: "Utilisateurs", icon: "👥" },
];

const TYPE_LABELS = {
  mariage: "💍 Mariage",
  conference: "🎤 Conférence",
  evenement: "🎉 Événement",
};

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("spaces");
  const [spaces, setSpaces] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch espaces
      const spacesRes = await API.get("/admin/spaces");
      console.log("Spaces reçus:", spacesRes.data.length, spacesRes.data);
      setSpaces(spacesRes.data);
    } catch (err) {
      console.error("Erreur espaces:", err.response?.status, err.response?.data);
      setError(`Erreur espaces: ${err.response?.data?.message || err.message}`);
      toast.error("Erreur chargement des espaces");
    }

    try {
      // Fetch users
      const usersRes = await API.get("/admin/users");
      console.log("Users reçus:", usersRes.data.length);
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Erreur users:", err.response?.status, err.response?.data);
      toast.error("Erreur chargement des utilisateurs");
    }

    setLoading(false);
  };

  const handleValidate = async (spaceId) => {
    try {
      await API.put(`/admin/spaces/${spaceId}/validate`);
      setSpaces((prev) => prev.map((s) => s._id === spaceId ? { ...s, isValidated: true, isRefused: false } : s));
      toast.success("Espace validé ✅");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur validation");
    }
  };

  const handleRefuse = async (spaceId) => {
    try {
      await API.put(`/admin/spaces/${spaceId}/refuse`);
      setSpaces((prev) => prev.map((s) => s._id === spaceId ? { ...s, isValidated: false, isRefused: true } : s));
      toast.success("Espace refusé ❌");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur refus");
    }
  };

  const handleDeleteSpace = async (spaceId) => {
    if (!confirm("Supprimer cet espace définitivement ?")) return;
    try {
      await API.delete(`/spaces/${spaceId}`);
      setSpaces((prev) => prev.filter((s) => s._id !== spaceId));
      toast.success("Espace supprimé");
    } catch {
      toast.error("Erreur suppression");
    }
  };

  const pendingSpaces = spaces.filter((s) => !s.isValidated);
  const displayedSpaces = tab === "spaces" ? pendingSpaces : spaces;

  const stats = {
    total: spaces.length,
    pending: pendingSpaces.length,
    validated: spaces.filter((s) => s.isValidated).length,
    users: users.length,
    owners: users.filter((u) => u.role === "owner").length,
    clients: users.filter((u) => u.role === "client").length,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              🛡️ Admin Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">EventSpace — Panneau de contrôle</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-lg transition"
          >
            ← Retour au site
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Message d'erreur visible */}
        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-xl p-4 mb-6 text-sm">
            ❌ {error} — Vérifiez que le backend tourne et que vous êtes bien connecté en admin.
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Total espaces", value: stats.total, color: "text-blue-400", bg: "bg-blue-400/10" },
            { label: "⏳ En attente", value: stats.pending, color: "text-yellow-400", bg: "bg-yellow-400/10" },
            { label: "✅ Validés", value: stats.validated, color: "text-green-400", bg: "bg-green-400/10" },
            { label: "Utilisateurs", value: stats.users, color: "text-purple-400", bg: "bg-purple-400/10" },
            { label: "Propriétaires", value: stats.owners, color: "text-orange-400", bg: "bg-orange-400/10" },
            { label: "Clients", value: stats.clients, color: "text-cyan-400", bg: "bg-cyan-400/10" },
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} border border-gray-800 rounded-xl p-4`}>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-gray-400 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800 pb-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === t.id
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              {t.icon} {t.label}
              {t.id === "spaces" && stats.pending > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Chargement des données...</p>
          </div>
        ) : (
          <>
            {/* SPACES TABS */}
            {(tab === "spaces" || tab === "all-spaces") && (
              <div>
                {displayedSpaces.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">
                    <div className="text-5xl mb-3">{tab === "spaces" ? "✅" : "🏛️"}</div>
                    <p className="text-lg">
                      {tab === "spaces"
                        ? "Aucun espace en attente de validation"
                        : "Aucun espace dans la base de données"}
                    </p>
                    {tab === "all-spaces" && (
                      <p className="text-sm mt-2 text-gray-600">
                        Les propriétaires n'ont pas encore créé d'espaces.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayedSpaces.map((space) => {
                      const img = space.images?.[0]
                        ? `http://localhost:5000${space.images[0]}`
                        : null;
                      return (
                        <div
                          key={space._id}
                          className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col md:flex-row gap-4"
                        >
                          <div className="w-full md:w-36 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gray-800">
                            {img ? (
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl">🏛️</div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div>
                                <h3 className="font-bold text-white text-lg">{space.title}</h3>
                                <p className="text-gray-400 text-sm">
                                  {TYPE_LABELS[space.type] || space.type} · 📍 {space.location?.city}
                                </p>
                                <p className="text-gray-500 text-sm mt-1">
                                  Propriétaire :{" "}
                                  <span className="text-gray-300">{space.owner?.name}</span>
                                  <span className="text-gray-600"> ({space.owner?.email})</span>
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                                  space.isValidated
                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                    : space.isRefused
                                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                    : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                }`}
                              >
                                {space.isValidated ? "✅ Validé" : space.isRefused ? "❌ Refusé" : "⏳ En attente"}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-400">
                              <span className="bg-gray-800 px-3 py-1 rounded-lg">
                                💰 {space.price?.toLocaleString()} MAD/j
                              </span>
                              <span className="bg-gray-800 px-3 py-1 rounded-lg">
                                👥 {space.capacity} pers.
                              </span>
                              <span className="bg-gray-800 px-3 py-1 rounded-lg">
                                🖼️ {space.images?.length || 0} photo(s)
                              </span>
                              <span className="bg-gray-800 px-3 py-1 rounded-lg">
                                📅 {new Date(space.createdAt).toLocaleDateString("fr-FR")}
                              </span>
                            </div>

                            {space.description && (
                              <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                                {space.description}
                              </p>
                            )}

                            <div className="flex gap-3 mt-4 flex-wrap">
                              {!space.isValidated && (
                                <button
                                  onClick={() => handleValidate(space._id)}
                                  className="px-5 py-2 rounded-lg text-sm font-bold bg-green-500 text-white hover:bg-green-600 transition"
                                >
                                  ✅ Valider
                                </button>
                              )}
                              {!space.isRefused && (
                                <button
                                  onClick={() => handleRefuse(space._id)}
                                  className="px-5 py-2 rounded-lg text-sm font-bold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition"
                                >
                                  ❌ Refuser
                                </button>
                              )}
                              {(space.isRefused || space.isValidated) && (
                                <button
                                  onClick={async () => {
                                    await API.put(`/admin/spaces/${space._id}/pending`);
                                    setSpaces((prev) => prev.map((s) => s._id === space._id ? { ...s, isValidated: false, isRefused: false } : s));
                                    toast("Remis en attente 🔄");
                                  }}
                                  className="px-5 py-2 rounded-lg text-sm font-bold bg-gray-700 text-gray-300 hover:bg-gray-600 transition"
                                >
                                  🔄 Remettre en attente
                                </button>
                              )}
                              <button
                                onClick={() => navigate(`/spaces/${space._id}`)}
                                className="px-5 py-2 rounded-lg text-sm border border-gray-700 text-gray-300 hover:bg-gray-800 transition"
                              >
                                👁 Voir
                              </button>
                              <button
                                onClick={() => handleDeleteSpace(space._id)}
                                className="px-5 py-2 rounded-lg text-sm border border-red-900 text-red-400 hover:bg-red-900/30 transition"
                              >
                                🗑 Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* USERS TAB */}
            {tab === "users" && (
              <div className="overflow-x-auto">
                {users.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">
                    <div className="text-5xl mb-3">👥</div>
                    <p>Aucun utilisateur trouvé</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 text-left">
                        <th className="pb-3 pr-4">Utilisateur</th>
                        <th className="pb-3 pr-4">Email</th>
                        <th className="pb-3 pr-4">Rôle</th>
                        <th className="pb-3 pr-4">Inscrit le</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-900/50">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-white font-medium">{u.name}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-gray-400">{u.email}</td>
                          <td className="py-3 pr-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                u.role === "admin"
                                  ? "bg-red-500/20 text-red-400"
                                  : u.role === "owner"
                                  ? "bg-orange-500/20 text-orange-400"
                                  : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {u.role === "admin" ? "🛡️ Admin" : u.role === "owner" ? "🏢 Owner" : "👤 Client"}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-gray-500">
                            {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
