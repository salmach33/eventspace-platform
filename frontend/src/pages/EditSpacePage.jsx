import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Mic2, PartyPopper, X, Cake, Gem, Music, BookOpen } from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";
import { mediaUrl } from "../utils/media";

const EQUIPEMENTS_LIST = ["WiFi", "Parking", "Climatisation", "Cuisine", "Scène", "Sono", "Projecteur", "Tables", "Chaises", "Toilettes", "Sécurité", "Vestiaire"];

const SPACE_TYPES = [
  { v: "mariage",      l: "Mariage",            Icon: Heart },
  { v: "conference",   l: "Conférence",         Icon: Mic2 },
  { v: "evenement",    l: "Événement",          Icon: PartyPopper },
  { v: "anniversaire", l: "Anniversaire",       Icon: Cake },
  { v: "fiancailles",  l: "Fiançailles",        Icon: Gem },
  { v: "soiree",       l: "Soirée / Gala",      Icon: Music },
  { v: "seminaire",    l: "Séminaire",          Icon: BookOpen },
];

export default function EditSpacePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "", type: "mariage", description: "", price: "", capacity: "",
    address: "", city: "", country: "Maroc", equipements: [],
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    API.get(`/spaces/${id}`)
      .then(({ data }) => {
        setForm({
          title: data.title || "",
          type: data.type || "mariage",
          description: data.description || "",
          price: data.price || "",
          capacity: data.capacity || "",
          address: data.location?.address || "",
          city: data.location?.city || "",
          country: data.location?.country || "Maroc",
          equipements: data.equipements || [],
        });
        setExistingImages(data.images || []);
      })
      .catch(() => {
        toast.error("Impossible de charger l'espace");
        navigate("/dashboard");
      })
      .finally(() => setPageLoading(false));
  }, [id]);

  const toggleEquip = (eq) => {
    setForm((prev) => ({
      ...prev,
      equipements: prev.equipements.includes(eq)
        ? prev.equipements.filter((e) => e !== eq)
        : [...prev.equipements, eq],
    }));
  };

  const removeExistingImage = (imgPath) => {
    setExistingImages((prev) => prev.filter((img) => img !== imgPath));
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
      fd.append("existingImages", JSON.stringify(existingImages));
      newImages.forEach((img) => fd.append("images", img));

      await API.put(`/spaces/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Espace modifié avec succès !");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-teal-600 py-10 px-4 text-white text-center">
        <h1 className="text-3xl font-bold">Modifier l'espace</h1>
        <p className="text-teal-200">Mettez à jour les informations de votre salle</p>
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

          {/* Images existantes */}
          {existingImages.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700">Photos actuelles</label>
              <div className="mt-2 flex gap-2 flex-wrap">
                {existingImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={mediaUrl(img)} className="w-20 h-20 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"
                      title="Supprimer cette photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">Survolez une photo et cliquez sur la croix pour la retirer</p>
            </div>
          )}

          {/* Nouvelles images */}
          <div>
            <label className="text-sm font-medium text-gray-700">Ajouter de nouvelles photos</label>
            <input
              type="file" accept="image/*" multiple
              onChange={(e) => setNewImages(Array.from(e.target.files))}
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-teal-600 file:text-white file:text-sm file:cursor-pointer"
            />
            {newImages.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {newImages.map((img, i) => (
                  <img key={i} src={URL.createObjectURL(img)} className="w-20 h-20 object-cover rounded-lg" />
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 disabled:opacity-50 transition"
            >
              {loading ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
