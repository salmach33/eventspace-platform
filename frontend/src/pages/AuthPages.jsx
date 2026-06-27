import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, User } from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const ROLE_OPTIONS = [
  { v: "client", l: "Client", d: "Je recherche des espaces", Icon: User },
  { v: "owner", l: "Propriétaire", d: "Je propose des espaces", Icon: Building2 },
];

function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative mt-1">
      <input
        type={show ? "text" : "password"}
        required
        value={value}
        onChange={onChange}
        placeholder={placeholder || "••••••••"}
        className="w-full border border-gray-200 rounded-lg px-4 py-3 pr-11 focus:outline-none focus:ring-2 focus:ring-teal-400"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        <EyeIcon open={show} />
      </button>
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", form);
      login(data);
      toast.success(`Bienvenue, ${data.name} !`);
      navigate(data.role === "admin" ? "/admin" : "/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Building2 className="w-9 h-9 mx-auto mb-2 text-teal-600" />
          <h1 className="text-2xl font-bold text-gray-800">Connexion</h1>
          <p className="text-gray-500 text-sm">Accédez à votre espace EventSpace</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="votre@email.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Mot de passe</label>
            <PasswordInput
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 disabled:opacity-50 transition">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Pas de compte ?{" "}
          <Link to="/register" className="text-teal-600 font-semibold hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", cin: "", role: "client" });
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role: form.role };
      if (form.role === "owner") {
        payload.phone = form.phone;
        payload.cin = form.cin;
      }
      const { data } = await API.post("/auth/register", payload);
      login(data);
      toast.success("Compte créé avec succès !");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const isOwner = form.role === "owner";

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <Building2 className="w-9 h-9 mx-auto mb-2 text-teal-600" />
          <h1 className="text-2xl font-bold text-gray-800">Créer un compte</h1>
          <p className="text-gray-500 text-sm">Rejoignez la plateforme EventSpace</p>
        </div>

        {/* Sélection du rôle */}
        <div className="flex gap-3 mb-6">
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.v} type="button"
              onClick={() => setForm((f) => ({ ...f, role: opt.v, phone: "" }))}
              className={`flex-1 p-3 rounded-xl border-2 text-left transition ${form.role === opt.v ? "border-teal-600 bg-teal-50" : "border-gray-200 hover:border-teal-300"}`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-sm">
                <opt.Icon className="w-3.5 h-3.5" /> {opt.l}
              </div>
              <div className="text-xs text-gray-500">{opt.d}</div>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom complet — commun aux deux */}
          <div>
            <label className="text-sm font-medium text-gray-700">Nom complet</label>
            <input
              type="text" required value={form.name} onChange={set("name")}
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="Votre nom complet"
            />
          </div>

          {/* Email — commun aux deux */}
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email" required value={form.email} onChange={set("email")}
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="votre@email.com"
            />
          </div>

          {/* Téléphone — propriétaire uniquement */}
          {isOwner && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Téléphone 
                </label>
                <input
                  type="tel" required value={form.phone} onChange={set("phone")}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="+212 6XX XXX XXX"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  CIN <span className="text-teal-600 text-xs">(Carte d'Identité Nationale)</span>
                </label>
                <input
                  type="text" required value={form.cin} onChange={set("cin")}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400 uppercase"
                  placeholder="AB123456"
                  maxLength={10}
                />
              </div>
            </>
          )}

          {/* Mot de passe — commun aux deux */}
          <div>
            <label className="text-sm font-medium text-gray-700">Mot de passe</label>
            <PasswordInput
              value={form.password}
              onChange={set("password")}
              placeholder="Min. 6 caractères"
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 disabled:opacity-50 transition mt-2">
            {loading ? "Création..." : `Créer mon compte ${isOwner ? "propriétaire" : ""}`}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-teal-600 font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
