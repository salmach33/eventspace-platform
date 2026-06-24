import { useState, useEffect } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Building2, Users, CalendarCheck, Wallet, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminDashboardSection from "../components/admin/AdminDashboardSection";
import AdminSpacesSection from "../components/admin/AdminSpacesSection";
import AdminUsersSection from "../components/admin/AdminUsersSection";
import AdminReservationsSection from "../components/admin/AdminReservationsSection";
import AdminPaymentsSection from "../components/admin/AdminPaymentsSection";

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState("dashboard");
  const [spaces, setSpaces] = useState([]);
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);

    const endpoints = [
      { url: "/admin/spaces", setter: setSpaces, label: "espaces" },
      { url: "/admin/users", setter: setUsers, label: "utilisateurs" },
      { url: "/admin/reservations", setter: setReservations, label: "réservations" },
      { url: "/admin/payments", setter: setPayments, label: "paiements" },
    ];

    const results = await Promise.allSettled(endpoints.map((e) => API.get(e.url)));
    results.forEach((result, i) => {
      const { url, setter, label } = endpoints[i];
      if (result.status === "fulfilled") {
        setter(result.value.data);
      } else {
        const err = result.reason;
        console.error(`Erreur ${label}:`, err.response?.status, err.response?.data);
        if (url === "/admin/spaces") {
          setError(`Erreur espaces: ${err.response?.data?.message || err.message}`);
        }
        toast.error(`Erreur chargement des ${label}`);
      }
    });

    setLoading(false);
  };

  const handleValidate = async (spaceId) => {
    try {
      await API.put(`/admin/spaces/${spaceId}/validate`);
      setSpaces((prev) => prev.map((s) => s._id === spaceId ? { ...s, isValidated: true, isRefused: false } : s));
      toast.success("Espace validé");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur validation");
    }
  };

  const handleRefuse = async (spaceId) => {
    try {
      await API.put(`/admin/spaces/${spaceId}/refuse`);
      setSpaces((prev) => prev.map((s) => s._id === spaceId ? { ...s, isValidated: false, isRefused: true } : s));
      toast.success("Espace refusé");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur refus");
    }
  };

  const handlePending = async (spaceId) => {
    try {
      await API.put(`/admin/spaces/${spaceId}/pending`);
      setSpaces((prev) => prev.map((s) => s._id === spaceId ? { ...s, isValidated: false, isRefused: false } : s));
      toast("Remis en attente");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  const handleDeleteSpace = async (spaceId) => {
    if (!confirm("Supprimer cet espace définitivement ?")) return;
    try {
      await API.delete(`/spaces/${spaceId}`);
      setSpaces((prev) => prev.filter((s) => s._id !== spaceId));
      toast.success("Espace supprimé");
    } catch {
      toast.error("Erreur suppression");
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      await API.put(`/admin/users/${userId}/block`);
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isBlocked: true } : u));
      toast.success("Utilisateur bloqué");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur blocage");
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await API.put(`/admin/users/${userId}/unblock`);
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isBlocked: false } : u));
      toast.success("Utilisateur débloqué");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur déblocage");
    }
  };

  const handleChangeUserRole = async (userId, role) => {
    try {
      await API.put(`/admin/users/${userId}/role`, { role });
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role } : u));
      toast.success("Rôle mis à jour");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur changement de rôle");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Supprimer cet utilisateur définitivement ?")) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("Utilisateur supprimé");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur suppression");
    }
  };

  const pendingSpaces = spaces.filter((s) => !s.isValidated && !s.isRefused);

  const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { id: "spaces", label: "Espaces", Icon: Building2, badge: pendingSpaces.length },
    { id: "users", label: "Utilisateurs", Icon: Users },
    { id: "reservations", label: "Réservations", Icon: CalendarCheck },
    { id: "payments", label: "Paiements", Icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      <AdminSidebar
        items={NAV_ITEMS}
        active={section}
        onChange={setSection}
        onLogout={() => { logout(); navigate("/login"); }}
      />

      <main className="flex-1 min-w-0 px-6 py-8 max-w-[1400px]">
        {error && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 mb-6 text-sm">
            <XCircle className="w-4 h-4 flex-shrink-0" /> {error} — Vérifiez que le backend tourne et que vous êtes bien connecté en admin.
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Chargement des données...</p>
          </div>
        ) : (
          <>
            {section === "dashboard" && (
              <AdminDashboardSection
                spaces={spaces}
                users={users}
                reservations={reservations}
                payments={payments}
                onNavigate={setSection}
              />
            )}
            {section === "spaces" && (
              <AdminSpacesSection
                spaces={spaces}
                onValidate={handleValidate}
                onRefuse={handleRefuse}
                onPending={handlePending}
                onDelete={handleDeleteSpace}
                onView={(id) => navigate(`/spaces/${id}`)}
              />
            )}
            {section === "users" && (
              <AdminUsersSection
                users={users}
                currentUserId={user?._id}
                onChangeRole={handleChangeUserRole}
                onBlock={handleBlockUser}
                onUnblock={handleUnblockUser}
                onDelete={handleDeleteUser}
              />
            )}
            {section === "reservations" && <AdminReservationsSection reservations={reservations} />}
            {section === "payments" && <AdminPaymentsSection payments={payments} />}
          </>
        )}
      </main>
    </div>
  );
}
