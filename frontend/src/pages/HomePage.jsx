import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import SpaceCard from "../components/SpaceCard";

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
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">
            Trouvez l'espace parfait<br />pour votre événement
          </h1>
          <p className="text-xl text-indigo-100 mb-10">
            Mariages, conférences, événements — réservez en quelques clics
          </p>
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Rechercher une salle, une ville..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-5 py-4 rounded-xl text-gray-800 text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button type="submit" className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 shadow-lg transition">
              Rechercher
            </button>
          </form>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Nos catégories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { type: "mariage", label: "Salles Mariage", icon: "💍", color: "from-pink-400 to-rose-500" },
            { type: "conference", label: "Salles Conférence", icon: "🎤", color: "from-blue-400 to-indigo-500" },
            { type: "evenement", label: "Salles Événement", icon: "🎉", color: "from-purple-400 to-violet-500" },
          ].map((cat) => (
            <button
              key={cat.type}
              onClick={() => navigate(`/spaces?type=${cat.type}`)}
              className={`bg-gradient-to-br ${cat.color} text-white p-8 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center`}
            >
              <div className="text-5xl mb-3">{cat.icon}</div>
              <div className="text-xl font-bold">{cat.label}</div>
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
    </div>
  );
}
