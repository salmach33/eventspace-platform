import { useMemo, useState } from "react";
import { Users, Ban, RotateCcw, Trash2 } from "lucide-react";
import AdminFilterBar from "./AdminFilterBar";
import { useAdminTable, SortableTh, AdminPagination } from "./AdminTableControls";
import { Badge, ROLE_BADGE, BLOCKED_BADGE, ACTIVE_BADGE } from "./adminConfig";

const SORTERS = {
  name: (u) => u.name?.toLowerCase() || "",
  email: (u) => u.email?.toLowerCase() || "",
  role: (u) => u.role || "",
  createdAt: (u) => new Date(u.createdAt).getTime(),
};

export default function AdminUsersSection({ users, currentUserId, onChangeRole, onBlock, onUnblock, onDelete }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter === "blocked" && !u.isBlocked) return false;
      if (statusFilter === "active" && u.isBlocked) return false;
      if (q) {
        const haystack = `${u.name} ${u.email}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  const { pageItems, sortKey, sortDir, toggleSort, page, setPage, totalPages, total } = useAdminTable(filtered, {
    sorters: SORTERS,
    defaultSort: "createdAt",
    defaultDir: "desc",
    pageSize: 8,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Utilisateurs</h2>
      </div>

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par nom ou email..."
        resultsCount={filtered.length}
        filters={[
          {
            label: "Tous les rôles",
            value: roleFilter,
            onChange: setRoleFilter,
            options: [
              { value: "admin", label: "Admin" },
              { value: "owner", label: "Propriétaire" },
              { value: "client", label: "Client" },
            ],
          },
          {
            label: "Tous les statuts",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "active", label: "Actif" },
              { value: "blocked", label: "Bloqué" },
            ],
          },
        ]}
      />

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white border border-gray-100 rounded-xl">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Aucun utilisateur ne correspond aux filtres</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-left">
                <SortableTh label="Utilisateur" sortKey="name" currentKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortableTh label="Email" sortKey="email" currentKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <th className="px-4 py-3">Téléphone</th>
                <SortableTh label="Rôle" sortKey="role" currentKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <th className="px-4 py-3">Statut</th>
                <SortableTh label="Inscrit le" sortKey="createdAt" currentKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.map((u) => {
                const isSelf = u._id === currentUserId;
                return (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-gray-900 font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 text-gray-400">{u.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={isSelf}
                        onChange={(e) => onChangeRole(u._id, e.target.value)}
                        className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:border-teal-400"
                      >
                        <option value="client">Client</option>
                        <option value="owner">Propriétaire</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3"><Badge cfg={u.isBlocked ? BLOCKED_BADGE : ACTIVE_BADGE} /></td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {u.isBlocked ? (
                          <button
                            onClick={() => onUnblock(u._id)}
                            disabled={isSelf}
                            title="Débloquer"
                            className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onBlock(u._id)}
                            disabled={isSelf}
                            title="Bloquer"
                            className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(u._id)}
                          disabled={isSelf}
                          title="Supprimer"
                          className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
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
          <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} total={total} pageSize={8} />
        </div>
      )}
    </div>
  );
}
