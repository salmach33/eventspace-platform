import { useMemo, useState } from "react";
import {
  Building2, CheckCircle2, XCircle, RotateCcw, Eye, Trash2, MapPin,
} from "lucide-react";
import AdminFilterBar from "./AdminFilterBar";
import { Badge, SPACE_STATUS_BADGE, TYPE_CONFIG } from "./adminConfig";

const spaceStatus = (s) => (s.isValidated ? "validated" : s.isRefused ? "refused" : "pending");

export default function AdminSpacesSection({ spaces, onValidate, onRefuse, onPending, onDelete, onView }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return spaces.filter((s) => {
      if (statusFilter !== "all" && spaceStatus(s) !== statusFilter) return false;
      if (typeFilter !== "all" && s.type !== typeFilter) return false;
      if (q) {
        const haystack = `${s.title} ${s.owner?.name || ""} ${s.owner?.email || ""} ${s.location?.city || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [spaces, search, statusFilter, typeFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Espaces</h2>
      </div>

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par titre, propriétaire, ville..."
        resultsCount={filtered.length}
        filters={[
          {
            label: "Tous les statuts",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "pending", label: "En attente" },
              { value: "validated", label: "Validé" },
              { value: "refused", label: "Refusé" },
            ],
          },
          {
            label: "Tous les types",
            value: typeFilter,
            onChange: setTypeFilter,
            options: Object.entries(TYPE_CONFIG).map(([value, cfg]) => ({ value, label: cfg.label })),
          },
        ]}
      />

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-gray-900 border border-gray-800 rounded-xl">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-700" />
          <p>Aucun espace ne correspond aux filtres</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-left">
                <th className="px-4 py-3">Espace</th>
                <th className="px-4 py-3">Propriétaire</th>
                <th className="px-4 py-3">Ville</th>
                <th className="px-4 py-3">Prix</th>
                <th className="px-4 py-3">Capacité</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Créé le</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.map((space) => {
                const img = space.images?.[0] ? `http://localhost:5000${space.images[0]}` : null;
                const typeCfg = TYPE_CONFIG[space.type];
                const status = spaceStatus(space);
                return (
                  <tr key={space._id} className="hover:bg-gray-800/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-[220px]">
                        <div className="w-12 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                          {img ? (
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">{space.title}</p>
                          <p className="text-gray-500 text-xs flex items-center gap-1">
                            {typeCfg && <typeCfg.Icon className="w-3 h-3" />} {typeCfg?.label || space.type}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      <p>{space.owner?.name}</p>
                      <p className="text-gray-600 text-xs">{space.owner?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {space.location?.city}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{space.price?.toLocaleString()} MAD</td>
                    <td className="px-4 py-3 text-gray-300">{space.capacity} pers.</td>
                    <td className="px-4 py-3"><Badge cfg={SPACE_STATUS_BADGE[status]} /></td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(space.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {status !== "validated" && (
                          <button
                            onClick={() => onValidate(space._id)}
                            title="Valider"
                            className="p-2 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 transition"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {status !== "refused" && (
                          <button
                            onClick={() => onRefuse(space._id)}
                            title="Refuser"
                            className="p-2 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {status !== "pending" && (
                          <button
                            onClick={() => onPending(space._id)}
                            title="Remettre en attente"
                            className="p-2 rounded-lg bg-gray-700/60 text-gray-300 hover:bg-gray-700 transition"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onView(space._id)}
                          title="Voir"
                          className="p-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(space._id)}
                          title="Supprimer"
                          className="p-2 rounded-lg border border-red-900 text-red-400 hover:bg-red-900/30 transition"
                        >
                          <Trash2 className="w-4 h-4" />
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
  );
}
