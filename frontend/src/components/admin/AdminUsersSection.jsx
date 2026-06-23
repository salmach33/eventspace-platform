import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import AdminFilterBar from "./AdminFilterBar";
import { Badge, ROLE_BADGE } from "./adminConfig";

export default function AdminUsersSection({ users }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (q) {
        const haystack = `${u.name} ${u.email}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [users, search, roleFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Utilisateurs</h2>
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
        ]}
      />

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-gray-900 border border-gray-800 rounded-xl">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-700" />
          <p>Aucun utilisateur ne correspond aux filtres</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-left">
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Inscrit le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-gray-800/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{u.email}</td>
                  <td className="px-4 py-3 text-gray-500">{u.phone || "—"}</td>
                  <td className="px-4 py-3"><Badge cfg={ROLE_BADGE[u.role] || ROLE_BADGE.client} /></td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString("fr-FR")}
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
