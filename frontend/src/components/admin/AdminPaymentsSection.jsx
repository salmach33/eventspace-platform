import { useMemo, useState } from "react";
import { Wallet, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminFilterBar from "./AdminFilterBar";
import { Badge, PAYMENT_STATUS_BADGE, PAYMENT_METHOD_LABEL } from "./adminConfig";

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

  const totalConfirmed = filtered
    .filter((p) => p.status === "confirmed")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Paiements</h2>
        <span className="text-sm text-gray-400">
          Total confirmé (filtré) : <span className="text-green-400 font-bold">{totalConfirmed.toLocaleString()} MAD</span>
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
        <div className="text-center py-20 text-gray-500 bg-gray-900 border border-gray-800 rounded-xl">
          <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-700" />
          <p>Aucun paiement ne correspond aux filtres</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-left">
                <th className="px-4 py-3">Réservation</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Propriétaire</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Méthode</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.map((p) => (
                <tr key={p._id} className="hover:bg-gray-800/40">
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {p.reservation?.date ? new Date(p.reservation.date).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    <p>{p.client?.name}</p>
                    <p className="text-gray-600 text-xs">{p.client?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    <p>{p.owner?.name}</p>
                    <p className="text-gray-600 text-xs">{p.owner?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{p.amount?.toLocaleString()} MAD</td>
                  <td className="px-4 py-3 text-gray-400">{PAYMENT_METHOD_LABEL[p.method] || p.method}</td>
                  <td className="px-4 py-3"><Badge cfg={PAYMENT_STATUS_BADGE[p.status]} /></td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.reservation?._id && (
                      <button
                        onClick={() => navigate(`/reservations/${p.reservation._id}`)}
                        title="Voir la réservation"
                        className="p-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition inline-flex"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
