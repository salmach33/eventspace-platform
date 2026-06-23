import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Heart, Mic2, PartyPopper } from "lucide-react";
import API from "../services/api";
import SpaceCard from "../components/SpaceCard";
import ChatIA from "../components/ChatIA";

const CATEGORIES = [
  { type: "mariage", label: "Salles Mariage", Icon: Heart, iconBg: "bg-rose-100", iconColor: "text-rose-600" },
  { type: "conference", label: "Salles Conférence", Icon: Mic2, iconBg: "bg-sky-100", iconColor: "text-sky-600" },
  { type: "evenement", label: "Salles Événement", Icon: PartyPopper, iconBg: "bg-amber-100", iconColor: "text-amber-600" },
];

export default function HomePage() {
  const [spaces, setSpaces] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/spaces?").then(({ data }) => setSpaces(data.slice(0, 6))).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/spaces?search=${search}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-900 to-teal-700 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">
            Trouvez l'espace parfait<br />pour votre événement
          </h1>
          <p className="text-xl text-teal-100 mb-10">
            Mariages, conférences, événements — réservez en quelques clics
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
            <button type="submit" className="px-8 py-4 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-500 shadow-lg transition">
              Rechercher
            </button>
          </form>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Nos catégories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {CATEGORIES.map(({ type, label, Icon, iconBg, iconColor }) => (
            <button
              key={type}
              onClick={() => navigate(`/spaces?type=${type}`)}
              className="bg-white border border-gray-100 p-8 rounded-2xl shadow hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center"
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${iconBg}`}>
                <Icon className={`w-8 h-8 ${iconColor}`} />
              </div>
              <div className="text-xl font-bold text-gray-800">{label}</div>
            </button>
          ))}
        </div>

        {/* Recent spaces */}
        {spaces.length > 0 && (
          <>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Espaces récents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spaces.map((s) => <SpaceCard key={s._id} space={s} />)}
            </div>
          </>
        )}
      </div>

      {/* Chat IA */}
      <ChatIA />
    </div>
  );
}
