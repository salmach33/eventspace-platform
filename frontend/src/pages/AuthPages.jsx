import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2, User, Eye, EyeOff, Mail, Lock,
  Phone, CreditCard, ArrowRight, Check,
} from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

/* ── shared inputs ─────────────────────────────────────────── */

function Field({ icon: Icon, label, type = "text", value, onChange, placeholder, required = true, maxLength }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />}
        <input
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm transition`}
        />
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, placeholder = "••••••••" }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type={show ? "text" : "password"}
          required
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm transition"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

/* ── background ─────────────────────────────────────────────── */

function Background() {
  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-900 via-teal-900 to-teal-700">
      <div className="absolute top-[-120px] left-[-120px] w-[480px] h-[480px] rounded-full bg-teal-500/20 blur-3xl" />
      <div className="absolute bottom-[-100px] right-[-80px] w-[400px] h-[400px] rounded-full bg-teal-400/15 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-3xl" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   LOGIN
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
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <Background />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-5 py-2.5 rounded-2xl">
            <Building2 className="w-6 h-6 text-teal-300" />
            <span className="text-xl font-extrabold tracking-tight">EventSpace</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-black/30 overflow-hidden">
          {/* top accent */}
          <div className="h-1.5 bg-gradient-to-r from-teal-400 via-teal-500 to-emerald-400" />

          <div className="px-8 py-8">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Connexion</h1>
            <p className="text-gray-400 text-sm mb-7">Accédez à votre espace EventSpace</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field
                icon={Mail}
                label="Adresse email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="votre@email.com"
              />
              <PasswordField
                label="Mot de passe"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-teal-500/30 transition-all disabled:opacity-60"
              >
                {loading ? <><Spinner /> Connexion…</> : <>Se connecter <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-7">
              Pas encore de compte ?{" "}
              <Link to="/register" className="text-teal-600 font-semibold hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

        {/* bottom text */}
        <p className="text-center text-white/30 text-xs mt-6">© 2025 EventSpace — Tous droits réservés</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   REGISTER
══════════════════════════════════════════════════════════════ */

const ROLE_OPTIONS = [
  { v: "client", l: "Client",       d: "Je cherche un espace", Icon: User,      color: "teal" },
  { v: "owner",  l: "Propriétaire", d: "Je propose un espace", Icon: Building2, color: "indigo" },
];

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", cin: "", role: "client" });
  const [loading, setLoading] = useState(false);
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role: form.role };
      if (form.role === "owner") { payload.phone = form.phone; payload.cin = form.cin; }
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
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <Background />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-5 py-2.5 rounded-2xl">
            <Building2 className="w-6 h-6 text-teal-300" />
            <span className="text-xl font-extrabold tracking-tight">EventSpace</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-black/30 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-teal-400 via-teal-500 to-emerald-400" />

          <div className="px-8 py-8">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Créer un compte</h1>
            <p className="text-gray-400 text-sm mb-6">Rejoignez la plateforme EventSpace</p>

            {/* Role tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl mb-6">
              {ROLE_OPTIONS.map((opt) => {
                const active = form.role === opt.v;
                return (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, role: opt.v, phone: "", cin: "" }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                      ${active ? "bg-white shadow text-teal-700" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <opt.Icon className="w-4 h-4" />
                    {opt.l}
                    {active && <Check className="w-3.5 h-3.5 text-teal-500" />}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field icon={User} label="Nom complet" value={form.name} onChange={set("name")} placeholder="Votre nom complet" />
              <Field icon={Mail} label="Adresse email" type="email" value={form.email} onChange={set("email")} placeholder="votre@email.com" />

              {isOwner && (
                <div className="grid grid-cols-2 gap-3">
                  <Field icon={Phone} label="Téléphone" type="tel" value={form.phone} onChange={set("phone")} placeholder="+212 6XX XXX XXX" />
                  <Field icon={CreditCard} label="CIN" value={form.cin} onChange={set("cin")} placeholder="AB123456" maxLength={10} />
                </div>
              )}

              <PasswordField label="Mot de passe" value={form.password} onChange={set("password")} placeholder="Min. 6 caractères" />

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-teal-500/30 transition-all disabled:opacity-60"
              >
                {loading
                  ? <><Spinner /> Création…</>
                  : <>Créer mon compte {isOwner ? "propriétaire" : ""} <ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-7">
              Déjà un compte ?{" "}
              <Link to="/login" className="text-teal-600 font-semibold hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">© 2025 EventSpace — Tous droits réservés</p>
      </div>
    </div>
  );
}
