import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

const EQUIPEMENTS_LIST = ["WiFi", "Parking", "Climatisation", "Cuisine", "Scène", "Sono", "Projecteur", "Tables", "Chaises", "Toilettes", "Sécurité", "Vestiaire"];

export function MySpacesPage() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/spaces/owner/my-spaces")
      .then(({ data }) => setSpaces(data))
      .catch(() => toast.error("Erreur chargement"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cet espace ?")) return;
    try {
      await API.delete(`/spaces/${id}`);
      setSpaces((prev) => prev.filter((s) => s._id !== id));
      toast.success("Espace supprimé");
    } catch {
      toast.error("Erreur suppression");
    }
  };

  const TYPE_LABELS = { mariage: "💍 Mariage", conference: "🎤 Conférence", evenement: "🎉 Événement" };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-indigo-600 py-10 px-4 text-white">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mes Espaces</h1>
            <p className="text-indigo-200">{spaces.length} espace(s) publiés</p>
          </div>
          <Link to="/spaces/create" className="bg-white text-indigo-600 px-5 py-2 rounded-lg font-bold hover:bg-indigo-50 transition">
            + Ajouter
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : spaces.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏢</div>
            <p className="text-gray-500 mb-4">Vous n'avez pas encore d'espace</p>
            <Link to="/spaces/create" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
              Créer mon premier espace
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {spaces.map((space) => {
              const img = space.images?.[0] ? `http://localhost:5000${space.images[0]}` : null;
              return (
                <div key={space._id} className="bg-white rounded-2xl shadow p-5 flex gap-4">
                  {img ? (
                    <img src={img} alt="" className="w-28 h-20 object-cover rounded-xl flex-shrink-0" />
                  ) : (
                    <div className="w-28 h-20 bg-indigo-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">🏛️</div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800">{space.title}</h3>
                        <p className="text-gray-500 text-sm">{TYPE_LABELS[space.type]} · {space.location.city}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${space.isValidated ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {space.isValidated ? "✓ Validé" : "⏳ En attente"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="font-semibold text-indigo-600">{space.price.toLocaleString()} MAD/j</span>
                      <span>👥 {space.capacity} pers.</span>
                      <span>★ {space.averageRating > 0 ? space.averageRating.toFixed(1) : "Nouveau"}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Link to={`/spaces/${space._id}`} className="text-indigo-600 border border-indigo-200 px-3 py-1 rounded-lg text-sm hover:bg-indigo-50">
                        Voir
                      </Link>
                      <Link to={`/spaces/${space._id}/edit`} className="text-gray-600 border border-gray-200 px-3 py-1 rounded-lg text-sm hover:bg-gray-50">
                        Modifier
                      </Link>
                      <button onClick={() => handleDelete(space._id)} className="text-red-600 border border-red-200 px-3 py-1 rounded-lg text-sm hover:bg-red-50">
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function CreateSpacePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", type: "mariage", description: "", price: "", capacity: "",
    address: "", city: "", country: "Maroc", equipements: [],
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleEquip = (eq) => {
    setForm((prev) => ({
      ...prev,
      equipements: prev.equipements.includes(eq)
        ? prev.equipements.filter((e) => e !== eq)
        : [...prev.equipements, eq],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "equipements") fd.append(k, JSON.stringify(v));
        else fd.append(k, v);
      });
      images.forEach((img) => fd.append("images", img));

      await API.post("/spaces", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Espace créé ! En attente de validation.");
      navigate("/my-spaces");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-indigo-600 py-10 px-4 text-white text-center">
        <h1 className="text-3xl font-bold">Ajouter un espace</h1>
        <p className="text-indigo-200">Partagez votre salle avec des milliers de clients</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Titre de l'espace *</label>
            <input
              required value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Salle Al Boustane"
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Type d'espace *</label>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {[{ v: "mariage", l: "💍 Mariage" }, { v: "conference", l: "🎤 Conférence" }, { v: "evenement", l: "🎉 Événement" }].map((t) => (
                <button
                  key={t.v} type="button"
                  onClick={() => setForm({ ...form, type: t.v })}
                  className={`py-3 rounded-xl border-2 font-medium text-sm transition ${form.type === t.v ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600 hover:border-indigo-300"}`}
                >
                  {t.l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={4} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Décrivez votre espace, ses atouts..."
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Prix (MAD/jour) *</label>
              <input
                type="number" required min="0" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Capacité (personnes) *</label>
              <input
                type="number" required min="1" value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Adresse *</label>
            <input
              required value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Adresse complète"
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Ville *</label>
              <input
                required value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Ex: Casablanca"
                className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Pays</label>
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Équipements</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {EQUIPEMENTS_LIST.map((eq) => (
                <button
                  key={eq} type="button"
                  onClick={() => toggleEquip(eq)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${form.equipements.includes(eq) ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-600 hover:border-indigo-300"}`}
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Photos (max 10)</label>
            <input
              type="file" accept="image/*" multiple
              onChange={(e) => setImages(Array.from(e.target.files))}
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:text-sm file:cursor-pointer"
            />
            {images.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <img key={i} src={URL.createObjectURL(img)} className="w-16 h-16 object-cover rounded-lg" />
                ))}
              </div>
            )}
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? "Création en cours..." : "Publier l'espace"}
          </button>
        </form>
      </div>
    </div>
  );
}
