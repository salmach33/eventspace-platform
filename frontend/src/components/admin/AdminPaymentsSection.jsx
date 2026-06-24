import { useMemo, useState } from "react";
import { Wallet, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminFilterBar from "./AdminFilterBar";
import { useAdminTable, SortableTh, AdminPagination } from "./AdminTableControls";
import { Badge, PAYMENT_STATUS_BADGE, PAYMENT_METHOD_LABEL } from "./adminConfig";

const SORTERS = {
  client: (p) => p.client?.name?.toLowerCase() || "",
  amount: (p) => p.amount || 0,
  createdAt: (p) => new Date(p.createdAt).getTime(),
};

export default function AdminPaymentsSection({ payments }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (methodFilter !== "all" && p.method !== methodFilter) return false;
      if (q) {
        const haystack = `${p.client?.name || ""} ${p.client?.email || ""} ${p.owner?.name || ""} ${p.owner?.email || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [payments, search, statusFilter, methodFilter]);

  const { pageItems, sortKey, sortDir, toggleSort, page, setPage, totalPages, total } = useAdminTable(filtered, {
    sorters: SORTERS,
    defaultSort: "createdAt",
    defaultDir: "desc",
    pageSize: 8,
  });

  const totalConfirmed = filtered
    .filter((p) => p.status === "confirmed")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Paiements</h2>
        <span className="text-sm text-gray-500">
          Total confirmé (filtré) : <span className="text-emerald-600 font-bold">{totalConfirmed.toLocaleString()} MAD</span>
        </span>
      </div>

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par client ou propriétaire..."
        resultsCount={filtered.length}
        filters={[
          {
            label: "Tous les statuts",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "pending", label: "En attente" },
              { value: "confirmed", label: "Confirmé" },
              { value: "cancelled", label: "Annulé" },
              { value: "refunded", label: "Remboursé" },
            ],
          },
          {
            label: "Toutes les méthodes",
            value: methodFilter,
            onChange: setMethodFilter,
            options: Object.entries(PAYMENT_METHOD_LABEL).map(([value, label]) => ({ value, label })),
          },
        ]}
      />

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white border border-gray-100 rounded-xl">
          <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Aucun paiement ne correspond aux filtres</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-left">
                <th className="px-4 py-3">Réservation</th>
                <SortableTh label="Client" sortKey="client" currentKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <th className="px-4 py-3">Propriétaire</th>
                <SortableTh label="Montant" sortKey="amount" currentKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <th className="px-4 py-3">Méthode</th>
                <th className="px-4 py-3">Statut</th>
                <SortableTh label="Date" sortKey="createdAt" currentKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {p.reservation?.date ? new Date(p.reservation.date).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <p>{p.client?.name}</p>
                    <p className="text-gray-400 text-xs">{p.client?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <p>{p.owner?.name}</p>
                    <p className="text-gray-400 text-xs">{p.owner?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-900 font-medium whitespace-nowrap">{p.amount?.toLocaleString()} MAD</td>
                  <td className="px-4 py-3 text-gray-500">{PAYMENT_METHOD_LABEL[p.method] || p.method}</td>
                  <td className="px-4 py-3"><Badge cfg={PAYMENT_STATUS_BADGE[p.status]} /></td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`/payments/${p._id}`)}
                      title="Voir le paiement"
                      className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition inline-flex"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} total={total} pageSize={8} />
        </div>
      )}
    </div>
  );
}
