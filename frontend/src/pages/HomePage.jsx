import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Heart, Mic2, PartyPopper, Cake, Gem, Music, BookOpen,
  CheckCircle, Calendar, Star, ArrowRight, Users, Shield, Zap
} from "lucide-react";
import API from "../services/api";
import SpaceCard from "../components/SpaceCard";
import ChatIA from "../components/ChatIA";

const CATEGORIES = [
  { type: "mariage",      label: "Mariage",       Icon: Heart,       bg: "from-rose-400 to-pink-500",    light: "bg-rose-50 text-rose-700" },
  { type: "conference",   label: "Conférence",    Icon: Mic2,        bg: "from-sky-400 to-blue-500",     light: "bg-sky-50 text-sky-700" },
  { type: "evenement",    label: "Événement",     Icon: PartyPopper, bg: "from-amber-400 to-orange-500", light: "bg-amber-50 text-amber-700" },
  { type: "anniversaire", label: "Anniversaire",  Icon: Cake,        bg: "from-purple-400 to-violet-500",light: "bg-purple-50 text-purple-700" },
  { type: "fiancailles",  label: "Fiançailles",   Icon: Gem,         bg: "from-pink-400 to-rose-500",    light: "bg-pink-50 text-pink-700" },
  { type: "soiree",       label: "Soirée / Gala", Icon: Music,       bg: "from-indigo-400 to-purple-500",light: "bg-indigo-50 text-indigo-700" },
  { type: "seminaire",    label: "Séminaire",     Icon: BookOpen,    bg: "from-teal-400 to-emerald-500", light: "bg-teal-50 text-teal-700" },
];

const HOW_IT_WORKS = [
  { icon: Search,       step: "01", title: "Cherchez",    desc: "Parcourez des centaines d'espaces par type, ville ou capacité." },
  { icon: Calendar,     step: "02", title: "Réservez",    desc: "Choisissez vos dates, confirmez en quelques clics, paiement sécurisé." },
  { icon: CheckCircle,  step: "03", title: "Célébrez",    desc: "Profitez de votre événement inoubliable dans l'espace de vos rêves." },
];

function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (target === 0) return;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
      else setCount(target);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return count;
}

function StatCard({ value, suffix, label }) {
  const animated = useCountUp(value);
  return (
    <div>
      <p className="text-3xl font-extrabold text-teal-700">
        {animated}{suffix}
      </p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function HomePage() {
  const [spaces, setSpaces] = useState([]);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/spaces?").then(({ data }) => setSpaces(data.slice(0, 6))).catch(() => {});
    API.get("/stats").then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/spaces?search=${search}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-teal-900 to-teal-700 text-white overflow-hidden">
        {/* decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center px-4 py-28">

          <h1 className="text-5xl md:text-6xl font-extrabold mb-5 leading-tight">
            L'espace parfait pour<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300">
              chaque occasion
            </span>
          </h1>
          <p className="text-xl text-teal-100 mb-10 max-w-2xl mx-auto">
            Mariages, conférences, anniversaires — trouvez et réservez la salle idéale en quelques minutes.
          </p>

          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une salle, une ville..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-5 py-4 rounded-xl text-gray-800 text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              Rechercher
            </button>
          </form>

          {/* quick links */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {["Mariage", "Conférence", "Anniversaire", "Soirée"].map((label) => (
              <button
                key={label}
                onClick={() => navigate(`/spaces?type=${label.toLowerCase().replace("é","e").replace("é","e")}`)}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-teal-100 text-sm rounded-full border border-white/20 transition"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <StatCard value={stats?.spaces ?? 0}       suffix="+"  label="Espaces disponibles" />
          <StatCard value={stats?.events ?? 0}       suffix="+"  label="Événements organisés" />
          <StatCard value={stats?.satisfaction ?? 0} suffix="%"  label="Clients satisfaits" />
          <StatCard value={stats?.users ?? 0}        suffix=""   label="Utilisateurs inscrits" />
        </div>
      </div>

      {/* ── Categories ── */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">Explorez par catégorie</h2>
          <p className="text-gray-500 mt-2">Choisissez le type d'espace qui correspond à votre événement</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {CATEGORIES.map(({ type, label, Icon, bg, light }) => (
            <button
              key={type}
              onClick={() => navigate(`/spaces?type=${type}`)}
              className="group relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden p-7 text-center"
            >
              <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${bg} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div className="text-base font-bold text-gray-800">{label}</div>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-gray-400 group-hover:text-teal-600 transition-colors">
                Voir les salles <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Featured spaces ── */}
      {spaces.length > 0 && (
        <div className="bg-gradient-to-b from-white to-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Espaces en vedette</h2>
                <p className="text-gray-500 mt-1">Les espaces les mieux notés du moment</p>
              </div>
              <button
                onClick={() => navigate("/spaces")}
                className="hidden md:flex items-center gap-2 text-teal-700 font-semibold hover:text-teal-500 transition"
              >
                Voir tous les espaces <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spaces.map((s) => <SpaceCard key={s._id} space={s} />)}
            </div>
            <div className="text-center mt-8 md:hidden">
              <button
                onClick={() => navigate("/spaces")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-700 text-white font-semibold rounded-xl hover:bg-teal-600 transition"
              >
                Voir tous les espaces <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── How it works ── */}
      <div className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Comment ça marche ?</h2>
            <p className="text-gray-500 mt-2">Réservez votre espace idéal en 3 étapes simples</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* connecting line (desktop) */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-teal-200 via-teal-400 to-teal-200 z-0" />

            {HOW_IT_WORKS.map(({ icon: Icon, step, title, desc, color }) => (
              <div key={step} className="relative z-10 bg-gray-50 rounded-2xl p-7 text-center border border-gray-100 hover:shadow-md transition-shadow">
                <div className="relative inline-flex mb-5">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
                    step === "01" ? "bg-gradient-to-br from-teal-500 to-teal-600" :
                    step === "02" ? "bg-gradient-to-br from-indigo-500 to-indigo-600" :
                                   "bg-gradient-to-br from-emerald-500 to-emerald-600"
                  }`}>
                    <Icon className="w-9 h-9 text-white" strokeWidth={1.75} />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-gray-200 text-xs font-black text-gray-500 flex items-center justify-center shadow-sm">
                    {step.replace("0", "")}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Trust / CTA ── */}
      <div className="bg-gradient-to-br from-teal-700 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="flex justify-center gap-6 mb-8 flex-wrap">
            {[
              { icon: Shield, text: "Paiement 100% sécurisé" },
              { icon: Star,   text: "Espaces vérifiés" },
              { icon: Users,  text: "Support dédié" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-teal-100 text-sm">
                <Icon className="w-4 h-4 text-teal-300" /> {text}
              </div>
            ))}
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Prêt à organiser votre prochain événement ?
          </h2>
          <p className="text-teal-200 mb-8 text-lg">
            Rejoignez des milliers de clients qui nous font confiance.
          </p>
          <button
            onClick={() => navigate("/spaces")}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-800 font-bold rounded-xl hover:bg-teal-50 shadow-lg transition-all duration-200 text-lg"
          >
            Découvrir les espaces <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat IA */}
      <ChatIA />
    </div>
  );
}
