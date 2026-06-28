import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, User, Eye, EyeOff, Mail, Lock, Phone, CreditCard, ArrowRight, Check } from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

/* ── shared helpers ─────────────────────────────────────────── */

function PasswordInput({ value, onChange, placeholder = "••••••••", label }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type={show ? "text" : "password"}
          required
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50 focus:bg-white transition"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function TextInput({ icon: Icon, label, type = "text", value, onChange, placeholder, required = true, maxLength }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
        <input
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50 focus:bg-white transition`}
        />
      </div>
    </div>
  );
}

/* ── left decorative panel ──────────────────────────────────── */

function HeroPanel({ title, sub, features }) {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-slate-900 via-teal-900 to-teal-700 text-white p-12 rounded-3xl relative overflow-hidden">
      {/* decorative circles */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-teal-500/20 rounded-full pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-teal-400/10 rounded-full pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-12">
          <Building2 className="w-8 h-8 text-teal-300" />
          <span className="text-2xl font-extrabold tracking-tight">EventSpace</span>
        </div>
        <h2 className="text-4xl font-extrabold leading-tight mb-4">{title}</h2>
        <p className="text-teal-200 text-lg leading-relaxed">{sub}</p>
      </div>

      <ul className="relative space-y-4">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-3 text-teal-100">
            <span className="w-6 h-6 rounded-full bg-teal-500/30 border border-teal-400/40 flex items-center justify-center flex-shrink-0">
              <Check className="w-3.5 h-3.5 text-teal-300" />
            </span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   LOGIN PAGE
══════════════════════════════════════════════════════════════ */

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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-6 items-stretch">

        <HeroPanel
          title={"Bienvenue sur\nEventSpace"}
          sub="La plateforme de référence pour réserver des espaces événementiels au Maroc."
          features={[
            "Centaines d'espaces vérifiés",
            "Réservation en quelques clics",
            "Paiement 100 % sécurisé",
            "Support disponible 24/7",
          ]}
        />

        {/* Form card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 flex flex-col justify-center">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Building2 className="w-7 h-7 text-teal-600" />
            <span className="text-xl font-extrabold text-gray-800">EventSpace</span>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Se connecter</h1>
          <p className="text-gray-500 text-sm mb-8">Accédez à votre espace personnel</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <TextInput
              icon={Mail}
              label="Adresse email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="votre@email.com"
            />
            <PasswordInput
              label="Mot de passe"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-md shadow-teal-100 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Connexion…
                </span>
              ) : (
                <>Se connecter <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Pas encore de compte ?{" "}
              <Link to="/register" className="text-teal-600 font-semibold hover:text-teal-700 hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   REGISTER PAGE
══════════════════════════════════════════════════════════════ */

const ROLE_OPTIONS = [
  {
    v: "client",
    l: "Client",
    d: "Je cherche un espace",
    Icon: User,
    gradient: "from-teal-500 to-emerald-500",
  },
  {
    v: "owner",
    l: "Propriétaire",
    d: "Je propose un espace",
    Icon: Building2,
    gradient: "from-indigo-500 to-purple-500",
  },
];

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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-6 items-stretch">

        <HeroPanel
          title={"Rejoignez\nEventSpace"}
          sub="Créez votre compte et commencez à organiser des événements inoubliables dès aujourd'hui."
          features={[
            "Accès à +500 espaces",
            "Réservation instantanée",
            "Assistance dédiée",
            "100 % gratuit à l'inscription",
          ]}
        />

        {/* Form card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 flex flex-col justify-center">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <Building2 className="w-7 h-7 text-teal-600" />
            <span className="text-xl font-extrabold text-gray-800">EventSpace</span>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Créer un compte</h1>
          <p className="text-gray-500 text-sm mb-6">Rejoignez la plateforme EventSpace</p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ROLE_OPTIONS.map((opt) => {
              const active = form.role === opt.v;
              return (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role: opt.v, phone: "", cin: "" }))}
                  className={`relative flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all duration-200 text-center overflow-hidden
                    ${active ? "border-teal-600 bg-teal-50 shadow-sm" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${opt.gradient}`}>
                    <opt.Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`font-bold text-sm ${active ? "text-teal-700" : "text-gray-700"}`}>{opt.l}</span>
                  <span className="text-xs text-gray-400">{opt.d}</span>
                  {active && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-teal-600 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextInput
              icon={User}
              label="Nom complet"
              value={form.name}
              onChange={set("name")}
              placeholder="Votre nom complet"
            />
            <TextInput
              icon={Mail}
              label="Adresse email"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="votre@email.com"
            />

            {isOwner && (
              <div className="grid grid-cols-2 gap-3">
                <TextInput
                  icon={Phone}
                  label="Téléphone"
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="+212 6XX XXX XXX"
                />
                <TextInput
                  icon={CreditCard}
                  label="CIN"
                  value={form.cin}
                  onChange={set("cin")}
                  placeholder="AB123456"
                  maxLength={10}
                />
              </div>
            )}

            <PasswordInput
              label="Mot de passe"
              value={form.password}
              onChange={set("password")}
              placeholder="Min. 6 caractères"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-md shadow-teal-100 mt-1"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Création…
                </span>
              ) : (
                <>
                  Créer mon compte {isOwner ? "propriétaire" : ""}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Déjà un compte ?{" "}
              <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-700 hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
