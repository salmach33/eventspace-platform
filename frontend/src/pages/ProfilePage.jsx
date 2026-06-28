import { useState } from "react";
import { User, Building2, ShieldCheck } from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { mediaUrl } from "../utils/media";

const ROLE_CONFIG = {
  client: { label: "Client", Icon: User },
  owner: { label: "Propriétaire", Icon: Building2 },
  admin: { label: "Admin", Icon: ShieldCheck },
};

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

function PasswordInput({ value, onChange, placeholder, required, minLength }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative mt-1">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
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

export default function ProfilePage() {
  const { user, login } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    mediaUrl(user?.avatar)
  );
  const [profileLoading, setProfileLoading] = useState(false);

  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", profileForm.name);
      fd.append("email", profileForm.email);
      fd.append("phone", profileForm.phone);
      if (avatarFile) fd.append("avatar", avatarFile);

      const { data } = await API.put("/auth/profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Met à jour localStorage ET le contexte avec le token existant
      const updatedUser = { ...user, ...data, token: user.token };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      login(updatedUser);

      toast.success("Profil mis à jour");
      setAvatarFile(null);
      // Mettre à jour l'aperçu avec l'URL serveur réelle
      if (data.avatar) {
        setAvatarPreview(mediaUrl(data.avatar));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    setPwdLoading(true);
    try {
      await API.put("/auth/password", {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      toast.success("Mot de passe modifié avec succès");
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors du changement");
    } finally {
      setPwdLoading(false);
    }
  };

  const roleCfg = ROLE_CONFIG[user?.role];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-teal-600 py-10 px-4 text-white text-center">
        <h1 className="text-3xl font-bold">Mon Profil</h1>
        <p className="text-teal-200">Gérez vos informations personnelles</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Carte résumé */}
        <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-teal-600 text-white flex items-center justify-center text-2xl font-bold overflow-hidden flex-shrink-0">
            {avatarPreview ? (
              <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg">{user?.name}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            {roleCfg && (
              <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
                <roleCfg.Icon className="w-3 h-3" /> {roleCfg.label}
              </span>
            )}
          </div>
        </div>

        {/* Formulaire informations */}
        <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl shadow p-6 space-y-5">
          <h2 className="font-bold text-gray-800 text-lg">Informations personnelles</h2>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-3xl font-bold text-gray-400 flex-shrink-0">
              {avatarPreview ? (
                <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <label className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer hover:bg-teal-700 transition">
                Changer la photo
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG — max 10MB</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Nom complet</label>
            <input
              required value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email" required value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Téléphone</label>
            <input
              type="tel" placeholder="+212 6XX XXX XXX" value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <button type="submit" disabled={profileLoading}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 disabled:opacity-50 transition">
            {profileLoading ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </form>

        {/* Formulaire mot de passe */}
        <form onSubmit={handlePasswordSubmit} className="bg-white rounded-2xl shadow p-6 space-y-5">
          <h2 className="font-bold text-gray-800 text-lg">Changer le mot de passe</h2>

          <div>
            <label className="text-sm font-medium text-gray-700">Mot de passe actuel</label>
            <PasswordInput
              value={pwdForm.currentPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Nouveau mot de passe</label>
            <PasswordInput
              value={pwdForm.newPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
              placeholder="Min. 6 caractères"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Confirmer le nouveau mot de passe</label>
            <PasswordInput
              value={pwdForm.confirmPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button type="submit" disabled={pwdLoading}
            className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-gray-900 disabled:opacity-50 transition">
            {pwdLoading ? "Modification..." : "Changer le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}
