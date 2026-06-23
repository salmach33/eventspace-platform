import {
  Building2, Clock, CheckCircle2, Users, CalendarCheck, Wallet, ArrowRight, MapPin,
} from "lucide-react";
import { Badge, RESERVATION_STATUS_BADGE } from "./adminConfig";

export default function AdminDashboardSection({ spaces, users, reservations, payments, onNavigate }) {
  const pendingSpaces = spaces.filter((s) => !s.isValidated && !s.isRefused);
  const confirmedRevenue = payments
    .filter((p) => p.status === "confirmed")
    .reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    { label: "Espaces", value: spaces.length, sub: `${pendingSpaces.length} en attente`, color: "text-blue-400", bg: "bg-blue-400/10", Icon: Building2, onClick: () => onNavigate("spaces") },
    { label: "Utilisateurs", value: users.length, sub: `${users.filter((u) => u.role === "owner").length} propriétaires`, color: "text-purple-400", bg: "bg-purple-400/10", Icon: Users, onClick: () => onNavigate("users") },
    { label: "Réservations", value: reservations.length, sub: `${reservations.filter((r) => r.status === "pending").length} en attente`, color: "text-cyan-400", bg: "bg-cyan-400/10", Icon: CalendarCheck, onClick: () => onNavigate("reservations") },
    { label: "Revenus confirmés", value: `${confirmedRevenue.toLocaleString()} MAD`, sub: `${payments.filter((p) => p.status === "pending").length} paiement(s) en attente`, color: "text-green-400", bg: "bg-green-400/10", Icon: Wallet, onClick: () => onNavigate("payments") },
  ];

  const recentSpaces = pendingSpaces.slice(0, 5);
  const recentReservations = reservations.slice(0, 5);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={stat.onClick}
            className={`${stat.bg} border border-gray-800 rounded-xl p-4 text-left hover:border-gray-700 transition`}
          >
            <div className="flex items-center justify-between">
              <stat.Icon className={`w-5 h-5 ${stat.color}`} />
              <ArrowRight className="w-3.5 h-3.5 text-gray-600" />
            </div>
            <div className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</div>
            <div className="text-gray-500 text-xs mt-1">{stat.label} · {stat.sub}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" /> Espaces en attente
            </h3>
            <button onClick={() => onNavigate("spaces")} className="text-xs text-teal-400 hover:underline">
              Tout voir
            </button>
          </div>
          {recentSpaces.length === 0 ? (
            <p className="text-gray-500 text-sm py-6 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-gray-700" /> Aucun espace en attente
            </p>
          ) : (
            <div className="space-y-3">
              {recentSpaces.map((s) => (
                <div key={s._id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{s.title}</p>
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {s.location?.city} · {s.owner?.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-cyan-400" /> Dernières réservations
            </h3>
            <button onClick={() => onNavigate("reservations")} className="text-xs text-teal-400 hover:underline">
              Tout voir
            </button>
          </div>
          {recentReservations.length === 0 ? (
            <p className="text-gray-500 text-sm py-6 text-center">Aucune réservation</p>
          ) : (
            <div className="space-y-3">
              {recentReservations.map((r) => (
                <div key={r._id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{r.space?.title}</p>
                    <p className="text-gray-500 text-xs truncate">{r.client?.name}</p>
                  </div>
                  <Badge cfg={RESERVATION_STATUS_BADGE[r.status]} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
