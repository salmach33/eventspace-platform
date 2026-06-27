import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Mic2, PartyPopper, Cake, Gem, Music, BookOpen } from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";

const EQUIPEMENTS_LIST = ["WiFi", "Parking", "Climatisation", "Cuisine", "Scène", "Sono", "Projecteur", "Tables", "Chaises", "Toilettes", "Sécurité", "Vestiaire"];

const SPACE_TYPES = [
  { v: "mariage",      l: "Mariage",      Icon: Heart },
  { v: "conference",   l: "Conférence",   Icon: Mic2 },
  { v: "evenement",    l: "Événement",    Icon: PartyPopper },
  { v: "anniversaire", l: "Anniversaire", Icon: Cake },
  { v: "fiancailles",  l: "Fiançailles",  Icon: Gem },
  { v: "soiree",       l: "Soirée / Gala", Icon: Music },
  { v: "seminaire",    l: "Séminaire",    Icon: BookOpen },
];

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
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-teal-600 py-10 px-4 text-white text-center">
        <h1 className="text-3xl font-bold">Ajouter un espace</h1>
        <p className="text-teal-200">Partagez votre salle avec des milliers de clients</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Titre de l'espace *</label>
            <input
              required value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Salle Al Boustane"
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Type d'espace *</label>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {SPACE_TYPES.map((t) => (
                <button
                  key={t.v} type="button"
                  onClick={() => setForm({ ...form, type: t.v })}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 font-medium text-sm transition ${form.type === t.v ? "border-teal-600 bg-teal-50 text-teal-700" : "border-gray-200 text-gray-600 hover:border-teal-300"}`}
                >
                  <t.Icon className="w-5 h-5" />
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
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Prix (MAD/jour) *</label>
              <input
                type="number" required min="0" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Capacité (personnes) *</label>
              <input
                type="number" required min="1" value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Adresse *</label>
            <input
              required value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Adresse complète"
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Ville *</label>
              <input
                required value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Ex: Casablanca"
                className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Pays</label>
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
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
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${form.equipements.includes(eq) ? "bg-teal-600 text-white border-teal-600" : "border-gray-200 text-gray-600 hover:border-teal-300"}`}
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
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-teal-600 file:text-white file:text-sm file:cursor-pointer"
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
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-teal-700 disabled:opacity-50 transition"
          >
            {loading ? "Création en cours..." : "Publier l'espace"}
          </button>
        </form>
      </div>
    </div>
  );
}
