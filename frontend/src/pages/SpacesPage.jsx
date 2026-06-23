import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import API from "../services/api";
import SpaceCard from "../components/SpaceCard";

export default function SpacesPage() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    type: searchParams.get("type") || "",
    city: "",
    minPrice: "",
    maxPrice: "",
    capacity: "",
  });

  const fetchSpaces = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await API.get("/spaces", { params });
      setSpaces(data);
    } catch {
      setSpaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSpaces(); }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchSpaces();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-teal-600 py-10 px-4 text-white text-center">
        <h1 className="text-3xl font-bold mb-2">Tous les espaces</h1>
        <p className="text-teal-200">Trouvez la salle idéale pour votre événement</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow p-6 sticky top-24">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">Filtres</h3>
            <form onSubmit={handleFilter} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 font-medium">Recherche</label>
                <input
                  type="text"
                  placeholder="Titre, description..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="">Tous</option>
                  <option value="mariage">Mariage</option>
                  <option value="conference">Conférence</option>
                  <option value="evenement">Événement</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Ville</label>
                <input
                  type="text"
                  placeholder="Ex: Casablanca"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-sm text-gray-600 font-medium">Prix min</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-gray-600 font-medium">Prix max</label>
                  <input
                    type="number"
                    placeholder="∞"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Capacité min</label>
                <input
                  type="number"
                  placeholder="Nb personnes"
                  value={filters.capacity}
                  onChange={(e) => setFilters({ ...filters, capacity: e.target.value })}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition"
              >
                Filtrer
              </button>
              <button
                type="button"
                onClick={() => { setFilters({ search: "", type: "", city: "", minPrice: "", maxPrice: "", capacity: "" }); fetchSpaces(); }}
                className="w-full border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Réinitialiser
              </button>
            </form>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <p className="text-gray-500 mb-4">{spaces.length} espace(s) trouvé(s)</p>
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : spaces.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Aucun espace trouvé</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {spaces.map((s) => <SpaceCard key={s._id} space={s} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
