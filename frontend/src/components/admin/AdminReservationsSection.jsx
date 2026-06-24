import { useMemo, useState } from "react";
import { CalendarCheck, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminFilterBar from "./AdminFilterBar";
import { useAdminTable, SortableTh, AdminPagination } from "./AdminTableControls";
import { Badge, RESERVATION_STATUS_BADGE, TYPE_CONFIG } from "./adminConfig";

const SORTERS = {
  space: (r) => r.space?.title?.toLowerCase() || "",
  client: (r) => r.client?.name?.toLowerCase() || "",
  date: (r) => new Date(r.date).getTime(),
  guests: (r) => r.guestCount || 0,
  price: (r) => r.totalPrice || 0,
};

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

  const { pageItems, sortKey, sortDir, toggleSort, page, setPage, totalPages, total } = useAdminTable(filtered, {
    sorters: SORTERS,
    defaultSort: "date",
    defaultDir: "desc",
    pageSize: 8,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Réservations</h2>
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
        <div className="text-center py-20 text-gray-400 bg-white border border-gray-100 rounded-xl">
          <CalendarCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Aucune réservation ne correspond aux filtres</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-left">
                <SortableTh label="Espace" sortKey="space" currentKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortableTh label="Client" sortKey="client" currentKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <th className="px-4 py-3">Propriétaire</th>
                <SortableTh label="Date" sortKey="date" currentKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortableTh label="Invités" sortKey="guests" currentKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortableTh label="Prix" sortKey="price" currentKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.map((r) => {
                const typeCfg = TYPE_CONFIG[r.space?.type];
                return (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-gray-900 font-medium">{r.space?.title || "—"}</p>
                      {typeCfg && (
                        <p className="text-gray-400 text-xs flex items-center gap-1">
                          <typeCfg.Icon className="w-3 h-3" /> {typeCfg.label}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <p>{r.client?.name}</p>
                      <p className="text-gray-400 text-xs">{r.client?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <p>{r.owner?.name}</p>
                      <p className="text-gray-400 text-xs">{r.owner?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(r.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.guestCount}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.totalPrice?.toLocaleString()} MAD</td>
                    <td className="px-4 py-3"><Badge cfg={RESERVATION_STATUS_BADGE[r.status]} /></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/reservations/${r._id}`)}
                        title="Voir le détail"
                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition inline-flex"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} total={total} pageSize={8} />
        </div>
      )}
    </div>
  );
}
