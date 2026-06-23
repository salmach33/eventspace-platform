import { useMemo, useState } from "react";
import { CalendarCheck, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminFilterBar from "./AdminFilterBar";
import { Badge, RESERVATION_STATUS_BADGE, TYPE_CONFIG } from "./adminConfig";

export default function AdminReservationsSection({ reservations }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reservations.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (q) {
        const haystack = `${r.space?.title || ""} ${r.client?.name || ""} ${r.client?.email || ""} ${r.owner?.name || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [reservations, search, statusFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Réservations</h2>
      </div>

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par espace, client, propriétaire..."
        resultsCount={filtered.length}
        filters={[
          {
            label: "Tous les statuts",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "pending", label: "En attente" },
              { value: "accepted", label: "Acceptée" },
              { value: "refused", label: "Refusée" },
              { value: "cancelled", label: "Annulée" },
            ],
          },
        ]}
      />

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-gray-900 border border-gray-800 rounded-xl">
          <CalendarCheck className="w-12 h-12 mx-auto mb-3 text-gray-700" />
          <p>Aucune réservation ne correspond aux filtres</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-left">
                <th className="px-4 py-3">Espace</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Propriétaire</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Invités</th>
                <th className="px-4 py-3">Prix</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.map((r) => {
                const typeCfg = TYPE_CONFIG[r.space?.type];
                return (
                  <tr key={r._id} className="hover:bg-gray-800/40">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{r.space?.title || "—"}</p>
                      {typeCfg && (
                        <p className="text-gray-500 text-xs flex items-center gap-1">
                          <typeCfg.Icon className="w-3 h-3" /> {typeCfg.label}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      <p>{r.client?.name}</p>
                      <p className="text-gray-600 text-xs">{r.client?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      <p>{r.owner?.name}</p>
                      <p className="text-gray-600 text-xs">{r.owner?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {new Date(r.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{r.guestCount}</td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{r.totalPrice?.toLocaleString()} MAD</td>
                    <td className="px-4 py-3"><Badge cfg={RESERVATION_STATUS_BADGE[r.status]} /></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/reservations/${r._id}`)}
                        title="Voir le détail"
                        className="p-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition inline-flex"
                      >
                        <Eye className="w-4 h-4" />
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
  );
}
