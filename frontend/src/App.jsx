import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotifProvider } from "./context/NotifContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SpacesPage from "./pages/SpacesPage";
import SpaceDetailPage from "./pages/SpaceDetailPage";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import DashboardPage from "./pages/DashboardPage";
import ReservationDetailPage from "./pages/ReservationDetailPage";
import PaymentDetailPage from "./pages/PaymentDetailPage";
import MessagesPage from "./pages/MessagesPage";
import { CreateSpacePage } from "./pages/MySpacesPage";
import EditSpacePage from "./pages/EditSpacePage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";

const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

// Les propriétaires et admins n'ont pas accès à la page d'accueil publique — ils sont redirigés vers leur tableau de bord
const HomeRoute = () => {
  const { user } = useAuth();
  if (user?.role === "owner") return <Navigate to="/dashboard" />;
  if (user?.role === "admin") return <Navigate to="/admin" />;
  return <HomePage />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin" element={
        <PrivateRoute roles={["admin"]}>
          <AdminPage />
        </PrivateRoute>
      } />

      <Route path="/*" element={
        <>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/spaces" element={<SpacesPage />} />
            <Route path="/spaces/create" element={<PrivateRoute roles={["owner", "admin"]}><CreateSpacePage /></PrivateRoute>} />
            <Route path="/spaces/:id/edit" element={<PrivateRoute roles={["owner", "admin"]}><EditSpacePage /></PrivateRoute>} />
            <Route path="/spaces/:id" element={<SpaceDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<PrivateRoute roles={["client", "owner"]}><DashboardPage /></PrivateRoute>} />
            <Route path="/reservations/:id" element={<PrivateRoute><ReservationDetailPage /></PrivateRoute>} />
            <Route path="/payments/:id" element={<PrivateRoute><PaymentDetailPage /></PrivateRoute>} />
            <Route path="/messages" element={<PrivateRoute roles={["client", "owner"]}><MessagesPage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotifProvider>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </NotifProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
