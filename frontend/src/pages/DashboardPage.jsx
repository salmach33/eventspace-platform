import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Building2, Calendar, CreditCard, Users, MapPin,
  Eye, Landmark, Wallet, Heart, Mic2, PartyPopper, Cake, Gem, Music, BookOpen,
} from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Badge, STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from "../components/StatusBadge";
import toast from "react-hot-toast";
import { mediaUrl } from "../utils/media";
import ConfirmModal from "../components/ConfirmModal";

const SPACE_TYPE_CONFIG = {
  mariage:      { label: "Mariage",      Icon: Heart },
  conference:   { label: "Conférence",   Icon: Mic2 },
  evenement:    { label: "Événement",    Icon: PartyPopper },
  anniversaire: { label: "Anniversaire", Icon: Cake },
  fiancailles:  { label: "Fiançailles",  Icon: Gem },
  soiree:       { label: "Soirée / Gala", Icon: Music },
  seminaire:    { label: "Séminaire",    Icon: BookOpen },
};

const PAYMENT_METHOD_CONFIG = {
  virement: { label: "Virement", Icon: Landmark },
  carte:    { label: "Carte",    Icon: CreditCard },
  cash:     { label: "Espèces",  Icon: Wallet },
};

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

const SPACE_STATUS_CONFIG = {
  pending:   { label: "En attente", dot: "bg-amber-500",   text: "text-amber-700" },
  validated: { label: "Validé",     dot: "bg-emerald-500", text: "text-emerald-700" },
  refused:   { label: "Refusé",     dot: "bg-rose-500",    text: "text-rose-700" },
};

const getSpaceStatus = (s) => (s.isRefused ? "refused" : s.isValidated ? "validated" : "pending");

function StatusBreakdown({ title, counts, configMap, total }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-gray-700 mb-4">{title}</h3>
      <div className="space-y-3">
        {Object.entries(configMap).map(([key, cfg]) => {
          const count = counts[key] || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center gap-1.5 text-gray-600">
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
                <span className="font-semibold text-gray-800">{count}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${cfg.dot}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user.role === "owner";

  const [reservations, setReservations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState(null);
  const [tab, setTab] = useState("overview"); // overview | reservations | payments | spaces
  const [statusFilter, setStatusFilter] = useState("all");
  const [spaceStatusFilter, setSpaceStatusFilter] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = isOwner ? "/reservations/owner" : "/reservations/my";
      const paymentsEndpoint = isOwner ? "/payments/owner" : "/payments/my";
      const [{ data }, { data: paymentsData }] = await Promise.all([
        API.get(endpoint),
        API.get(paymentsEndpoint),
      ]);
      setReservations(data);
      setPayments(paymentsData);
      if (isOwner) {
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

  const handleDeleteSpace = (spaceId) => {
    setConfirmModal({
      message: "Supprimer cet espace ?",
      description: "Cette action est définitive et irréversible.",
      variant: "danger",
      confirmLabel: "Supprimer",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await API.delete(`/spaces/${spaceId}`);
          toast.success("Espace supprimé");
          fetchData();
        } catch {
          toast.error("Erreur lors de la suppression");
        }
      },
    });
  };

  // Le plus récent paiement par réservation (payments triés du plus récent au plus ancien)
  const paymentByReservation = {};
  payments.forEach((p) => {
    const resId = p.reservation?._id || p.reservation;
    if (!paymentByReservation[resId]) paymentByReservation[resId] = p;
  });

  // Réservation complète associée à un paiement (utile car payment.reservation n'est que partiellement peuplé)
  const reservationById = {};
  reservations.forEach((r) => { reservationById[r._id] = r; });

  const resStats = {
    pending:   reservations.filter((r) => r.status === "pending").length,
    accepted:  reservations.filter((r) => r.status === "accepted").length,
    refused:   reservations.filter((r) => r.status === "refused").length,
    cancelled: reservations.filter((r) => r.status === "cancelled").length,
  };

  const paymentStats = {
    pending:   payments.filter((p) => p.status === "pending").length,
    confirmed: payments.filter((p) => p.status === "confirmed").length,
    cancelled: payments.filter((p) => p.status === "cancelled").length,
    refunded:  payments.filter((p) => p.status === "refunded").length,
  };

  const confirmedRevenue = payments.filter((p) => p.status === "confirmed").reduce((s, p) => s + p.amount, 0);
  const pendingRevenue = payments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);

  const spaceStats = {
    total:   spaces.length,
    valide:  spaces.filter((s) => s.isValidated === true).length,
    attente: spaces.filter((s) => !s.isValidated && !s.isRefused).length,
  };

  const spaceStatusCounts = {
    pending:   spaces.filter((s) => getSpaceStatus(s) === "pending").length,
    validated: spaces.filter((s) => getSpaceStatus(s) === "validated").length,
    refused:   spaces.filter((s) => getSpaceStatus(s) === "refused").length,
  };

  const filteredReservations = statusFilter === "all"
    ? reservations
    : reservations.filter((r) => r.status === statusFilter);

  const filteredSpaces = spaceStatusFilter === "all"
    ? spaces
    : spaces.filter((s) => getSpaceStatus(s) === spaceStatusFilter);

  const navItems = [
    { k: "overview", l: "Tableau de bord", Icon: LayoutDashboard },
    ...(isOwner ? [{ k: "spaces", l: "Espaces", Icon: Building2 }] : []),
    { k: "reservations", l: "Réservations", Icon: Calendar },
    { k: "payments", l: "Paiements", Icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          description={confirmModal.description}
          variant={confirmModal.variant}
          confirmLabel={confirmModal.confirmLabel}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 pt-8 flex flex-col md:flex-row gap-10">
        {/* Sidebar (owner) */}
        {isOwner && (
          <aside className="md:w-72 flex-shrink-0">
            <nav className="bg-white rounded-2xl border border-gray-100 p-3 flex md:flex-col gap-1.5 md:sticky md:top-8 overflow-x-auto">
              {navItems.map((item) => (
                <button
                  key={item.k}
                  onClick={() => setTab(item.k)}
                  className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-base font-medium whitespace-nowrap transition ${
                    tab === item.k ? "bg-teal-600 text-white" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.Icon className="w-5 h-5" /> {item.l}
                </button>
              ))}
            </nav>
          </aside>
        )}

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          {/* Onglets client (pas de sidebar) */}
          {!isOwner && (
            <div className="flex gap-1 mb-6 bg-white rounded-xl border border-gray-100 p-1 w-fit">
              {navItems.map((item) => (
                <button
                  key={item.k}
                  onClick={() => setTab(item.k)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    tab === item.k ? "bg-teal-600 text-white" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {item.l}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {tab === "overview" && (
                <div className="space-y-6">
                  <div className={`grid grid-cols-2 ${isOwner ? "md:grid-cols-4" : "md:grid-cols-3"} gap-4`}>
                    {isOwner && <StatCard label="Espaces" value={spaceStats.total} sub={`${spaceStats.valide} validé(s)`} />}
                    <StatCard label="Réservations" value={reservations.length} sub={`${resStats.accepted} acceptée(s)`} />
                    <StatCard label="Revenu confirmé" value={`${confirmedRevenue.toLocaleString()} MAD`} sub={`${paymentStats.confirmed} paiement(s)`} />
                    <StatCard label="En attente" value={`${pendingRevenue.toLocaleString()} MAD`} sub={`${paymentStats.pending} à confirmer`} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatusBreakdown title="Réservations par statut" counts={resStats} configMap={STATUS_CONFIG} total={reservations.length} />
                    <StatusBreakdown title="Paiements par statut" counts={paymentStats} configMap={PAYMENT_STATUS_CONFIG} total={payments.length} />
                  </div>
                </div>
              )}

              {tab === "spaces" && (
                <div>
                  {/* Filtres statut + ajout */}
                  <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                    <div className="flex gap-2 overflow-x-auto">
                      {[
                        { k: "all", l: "Tous", count: spaces.length },
                        ...Object.entries(SPACE_STATUS_CONFIG).map(([k, v]) => ({ k, l: v.label, count: spaceStatusCounts[k] })),
                      ].map(({ k, l, count }) => (
                        <button
                          key={k}
                          onClick={() => setSpaceStatusFilter(k)}
                          className={`px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                            spaceStatusFilter === k ? "bg-teal-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {l} ({count})
                        </button>
                      ))}
                    </div>
                    <Link to="/spaces/create" className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition whitespace-nowrap">
                      + Ajouter un espace
                    </Link>
                  </div>

                  {filteredSpaces.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-400">
                      <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Aucun espace</p>
                      <Link to="/spaces/create" className="mt-4 inline-block bg-teal-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-teal-700 transition">
                        Créer mon premier espace
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            <th className="px-5 py-3">Salle</th>
                            <th className="px-5 py-3">Ville</th>
                            <th className="px-5 py-3">Prix</th>
                            <th className="px-5 py-3">Capacité</th>
                            <th className="px-5 py-3">Statut</th>
                            <th className="px-5 py-3"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSpaces.map((s) => {
                            const img = mediaUrl(s.images?.[0]);
                            const TypeIcon = SPACE_TYPE_CONFIG[s.type]?.Icon;
                            return (
                              <tr
                                key={s._id}
                                onClick={() => navigate(`/spaces/${s._id}`)}
                                className="border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 transition"
                              >
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-3">
                                    {img ? (
                                      <img src={img} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                                    ) : (
                                      <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Building2 className="w-5 h-5 text-teal-600" />
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-semibold text-gray-800">{s.title}</div>
                                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                                        {TypeIcon && <TypeIcon className="w-3 h-3" />}
                                        {SPACE_TYPE_CONFIG[s.type]?.label}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-3 text-gray-600">{s.location?.city}</td>
                                <td className="px-5 py-3 font-semibold text-gray-800">{s.price?.toLocaleString()} MAD</td>
                                <td className="px-5 py-3 text-gray-600">
                                  <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {s.capacity}</span>
                                </td>
                                <td className="px-5 py-3"><Badge cfg={SPACE_STATUS_CONFIG[getSpaceStatus(s)]} /></td>
                                <td className="px-5 py-3 text-right">
                                  <div className="flex justify-end gap-2">
                                    <Link
                                      to={`/spaces/${s._id}/edit`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-100"
                                    >
                                      Modifier
                                    </Link>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDeleteSpace(s._id); }}
                                      className="border border-rose-200 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-rose-50"
                                    >
                                      Supprimer
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {tab === "reservations" && (
                <div>
                  {/* Filtres statut */}
                  <div className="flex gap-2 mb-5 overflow-x-auto">
                    {[
                      { k: "all", l: "Toutes", count: reservations.length },
                      ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ k, l: v.label, count: resStats[k] })),
                    ].map(({ k, l, count }) => (
                      <button
                        key={k}
                        onClick={() => setStatusFilter(k)}
                        className={`px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                          statusFilter === k ? "bg-teal-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {l} ({count})
                      </button>
                    ))}
                  </div>

                  {filteredReservations.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-400">
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Aucune réservation</p>
                      {!isOwner && (
                        <Link to="/spaces" className="mt-4 inline-block bg-teal-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-teal-700 transition">
                          Parcourir les espaces
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            <th className="px-5 py-3">Salle</th>
                            <th className="px-5 py-3">{isOwner ? "Client" : "Propriétaire"}</th>
                            <th className="px-5 py-3">Date</th>
                            <th className="px-5 py-3">Montant</th>
                            <th className="px-5 py-3">Statut</th>
                            <th className="px-5 py-3">Paiement</th>
                            <th className="px-5 py-3"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReservations.map((res) => {
                            const payment = paymentByReservation[res._id];
                            const spaceImg = mediaUrl(res.space?.images?.[0]);
                            return (
                              <tr
                                key={res._id}
                                onClick={() => navigate(`/reservations/${res._id}`)}
                                className="border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 transition"
                              >
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-3">
                                    {spaceImg ? (
                                      <img src={spaceImg} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                                    ) : (
                                      <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Building2 className="w-5 h-5 text-teal-600" />
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-semibold text-gray-800">{res.space?.title}</div>
                                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                                        <MapPin className="w-3 h-3" /> {res.space?.location?.city}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-3 text-gray-600">{isOwner ? res.client?.name : res.owner?.name}</td>
                                <td className="px-5 py-3 text-gray-600">{new Date(res.date).toLocaleDateString("fr-FR")}</td>
                                <td className="px-5 py-3 font-semibold text-gray-800">{res.totalPrice?.toLocaleString()} MAD</td>
                                <td className="px-5 py-3"><Badge cfg={STATUS_CONFIG[res.status]} /></td>
                                <td className="px-5 py-3">{payment ? <Badge cfg={PAYMENT_STATUS_CONFIG[payment.status]} /> : <span className="text-gray-300">—</span>}</td>
                                <td className="px-5 py-3 text-right">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); navigate(`/reservations/${res._id}`); }}
                                    className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-100"
                                  >
                                    <Eye className="w-3.5 h-3.5" /> Voir
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {tab === "payments" && (
                <div>
                  {payments.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-400">
                      <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Aucun paiement</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            <th className="px-5 py-3">Salle</th>
                            <th className="px-5 py-3">{isOwner ? "Client" : "Propriétaire"}</th>
                            <th className="px-5 py-3">Montant</th>
                            <th className="px-5 py-3">Méthode</th>
                            <th className="px-5 py-3">Date</th>
                            <th className="px-5 py-3">Statut</th>
                            <th className="px-5 py-3"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((payment) => {
                            const res = reservationById[payment.reservation?._id || payment.reservation];
                            const counterpart = isOwner ? payment.client : payment.owner;
                            const MethodIcon = PAYMENT_METHOD_CONFIG[payment.method]?.Icon;
                            return (
                              <tr
                                key={payment._id}
                                onClick={() => navigate(`/payments/${payment._id}`)}
                                className="border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 transition"
                              >
                                <td className="px-5 py-3 font-semibold text-gray-800">{res?.space?.title || "Réservation"}</td>
                                <td className="px-5 py-3 text-gray-600">{counterpart?.name}</td>
                                <td className="px-5 py-3 font-semibold text-gray-800">{payment.amount?.toLocaleString()} MAD</td>
                                <td className="px-5 py-3 text-gray-600">
                                  {MethodIcon ? (
                                    <span className="inline-flex items-center gap-1.5">
                                      <MethodIcon className="w-3.5 h-3.5" />
                                      {PAYMENT_METHOD_CONFIG[payment.method].label}
                                    </span>
                                  ) : payment.method}
                                </td>
                                <td className="px-5 py-3 text-gray-600">{new Date(payment.createdAt).toLocaleDateString("fr-FR")}</td>
                                <td className="px-5 py-3"><Badge cfg={PAYMENT_STATUS_CONFIG[payment.status]} /></td>
                                <td className="px-5 py-3 text-right">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); navigate(`/payments/${payment._id}`); }}
                                    className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-100"
                                  >
                                    <Eye className="w-3.5 h-3.5" /> Voir
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
