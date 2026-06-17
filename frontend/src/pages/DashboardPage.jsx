import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  pending:   { label: "En attente", color: "bg-yellow-100 text-yellow-700", icon: "⏳" },
  accepted:  { label: "Acceptée",   color: "bg-green-100 text-green-700",   icon: "✅" },
  refused:   { label: "Refusée",    color: "bg-red-100 text-red-700",       icon: "❌" },
  cancelled: { label: "Annulée",    color: "bg-gray-100 text-gray-600",     icon: "🚫" },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = user.role === "owner" ? "/reservations/owner" : "/reservations/my";
      const { data } = await API.get(endpoint);
      setReservations(data);
      if (user.role === "owner") {
        const { data: spaceData } = await API.get("/spaces/owner/my-spaces");
        setSpaces(spaceData);
      }
    } catch {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (resId, status) => {
    try {
      await API.put(`/reservations/${resId}/status`, { status });
      toast.success(status === "accepted" ? "Réservation acceptée ✅" : "Réservation refusée");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  const handleCancel = async (resId) => {
    if (!confirm("Confirmer l'annulation ?")) return;
    try {
      await API.put(`/reservations/${resId}/status`, { status: "cancelled" });
      toast.success("Réservation annulée");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  const filtered = activeTab === "all"
    ? reservations
    : reservations.filter((r) => r.status === activeTab);

  const resStats = {
    pending:   reservations.filter((r) => r.status === "pending").length,
    accepted:  reservations.filter((r) => r.status === "accepted").length,
    refused:   reservations.filter((r) => r.status === "refused").length,
    cancelled: reservations.filter((r) => r.status === "cancelled").length,
  };

  // Compteurs espaces exacts
  const spaceStats = {
    total:   spaces.length,
    valide:  spaces.filter((s) => s.isValidated === true).length,
    attente: spaces.filter((s) => !s.isValidated && !s.isRefused).length,
    refuse:  spaces.filter((s) => s.isRefused === true).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-indigo-600 py-10 px-4 text-white">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord</h1>
            <p className="text-indigo-200">Bonjour, {user.name} 👋</p>
          </div>
          {user.role === "owner" && (
            <div className="flex gap-3">
              <Link to="/my-spaces" className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition">
                🏛️ Mes Espaces
              </Link>
              <Link to="/spaces/create" className="bg-indigo-500 border border-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-400 transition">
                + Ajouter
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ── STATS ESPACES owner ── */}
        {user.role === "owner" && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-700 mb-3">🏛️ Mes Espaces</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow p-5 text-center border-t-4 border-indigo-500">
                <div className="text-3xl font-extrabold text-indigo-600">{spaceStats.total}</div>
                <div className="text-sm text-gray-500 mt-1">Total</div>
              </div>
              <div className="bg-white rounded-xl shadow p-5 text-center border-t-4 border-green-500">
                <div className="text-3xl font-extrabold text-green-600">{spaceStats.valide}</div>
                <div className="text-sm text-gray-500 mt-1">✅ Validés</div>
              </div>
              <div className="bg-white rounded-xl shadow p-5 text-center border-t-4 border-yellow-400">
                <div className="text-3xl font-extrabold text-yellow-500">{spaceStats.attente}</div>
                <div className="text-sm text-gray-500 mt-1">⏳ En attente</div>
              </div>
              <div className="bg-white rounded-xl shadow p-5 text-center border-t-4 border-red-500">
                <div className="text-3xl font-extrabold text-red-500">{spaceStats.refuse}</div>
                <div className="text-sm text-gray-500 mt-1">❌ Refusés</div>
              </div>
            </div>
          </div>
        )}

        {/* ── STATS RÉSERVATIONS ── */}
        <h2 className="text-lg font-bold text-gray-700 mb-3">
          📅 {user.role === "owner" ? "Réservations reçues" : "Mes Réservations"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="bg-white rounded-xl shadow p-4 text-center">
              <div className="text-2xl mb-1">{cfg.icon}</div>
              <div className="text-2xl font-bold text-gray-800">{resStats[key]}</div>
              <div className="text-xs text-gray-500">{cfg.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { k: "all", l: "Tous", count: reservations.length },
            ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ k, l: v.label, count: resStats[k] })),
          ].map(({ k, l, count }) => (
            <button
              key={k}
              onClick={() => setActiveTab(k)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                activeTab === k ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {l} ({count})
            </button>
          ))}
        </div>

        {/* Liste réservations */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow text-gray-400">
            <div className="text-5xl mb-3">📅</div>
            <p>Aucune réservation</p>
            {user.role === "client" && (
              <Link to="/spaces" className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition">
                Parcourir les espaces
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((res) => {
              const cfg = STATUS_CONFIG[res.status];
              const spaceImg = res.space?.images?.[0] ? `http://localhost:5000${res.space.images[0]}` : null;
              return (
                <div key={res._id} className="bg-white rounded-2xl shadow p-5 flex flex-col md:flex-row gap-4">
                  {spaceImg && (
                    <img src={spaceImg} alt="" className="w-full md:w-32 h-24 object-cover rounded-xl flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-800">{res.space?.title}</h3>
                        <p className="text-gray-500 text-sm">📍 {res.space?.location?.city}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <span>📅 {new Date(res.date).toLocaleDateString("fr-FR")}</span>
                      <span>👥 {res.guestCount} personnes</span>
                      <span className="font-semibold text-indigo-600">{res.totalPrice?.toLocaleString()} MAD</span>
                    </div>
                    {user.role === "owner" && (
                      <p className="text-sm text-gray-500 mt-1">
                        Client : <span className="font-medium">{res.client?.name}</span> ({res.client?.email})
                      </p>
                    )}
                    {res.message && (
                      <p className="text-sm text-gray-500 mt-1 italic">"{res.message}"</p>
                    )}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {user.role === "owner" && res.status === "pending" && (
                        <>
                          <button onClick={() => handleStatusChange(res._id, "accepted")} className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700">
                            ✅ Accepter
                          </button>
                          <button onClick={() => handleStatusChange(res._id, "refused")} className="bg-red-100 text-red-600 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-200">
                            ❌ Refuser
                          </button>
                        </>
                      )}
                      {user.role === "client" && res.status === "pending" && (
                        <button onClick={() => handleCancel(res._id)} className="border border-red-300 text-red-600 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-50">
                          Annuler
                        </button>
                      )}
                      <Link
                        to={`/messages?spaceId=${res.space?._id}&ownerId=${user.role === "owner" ? res.client?._id : res.owner?._id}`}
                        className="border border-indigo-300 text-indigo-600 px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-50"
                      >
                        💬 Message
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
