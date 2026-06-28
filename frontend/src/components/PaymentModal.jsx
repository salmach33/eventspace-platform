import { useState } from "react";
import { X, CreditCard, Landmark, Wallet, Shield, CheckCircle } from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";

const METHODS = [
  {
    value: "virement",
    label: "Virement bancaire",
    desc: "Transfert depuis votre compte bancaire",
    Icon: Landmark,
    color: "border-sky-300 bg-sky-50 text-sky-700",
    active: "border-sky-500 bg-sky-50 ring-2 ring-sky-300",
    icon_bg: "bg-sky-100 text-sky-600",
  },
  {
    value: "carte",
    label: "Carte bancaire",
    desc: "Visa, Mastercard, CMI",
    Icon: CreditCard,
    color: "border-violet-300 bg-violet-50 text-violet-700",
    active: "border-violet-500 bg-violet-50 ring-2 ring-violet-300",
    icon_bg: "bg-violet-100 text-violet-600",
  },
  {
    value: "cash",
    label: "Espèces",
    desc: "Paiement en main propre",
    Icon: Wallet,
    color: "border-emerald-300 bg-emerald-50 text-emerald-700",
    active: "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300",
    icon_bg: "bg-emerald-100 text-emerald-600",
  },
];

export default function PaymentModal({ reservation, onClose, onSuccess }) {
  const [method, setMethod] = useState("virement");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/payments", {
        reservationId: reservation._id,
        method,
      });
      toast.success("Paiement déclaré avec succès !");
      onSuccess?.(data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors du paiement");
    } finally {
      setLoading(false);
    }
  };

  const selected = METHODS.find((m) => m.value === method);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="relative bg-gradient-to-r from-teal-700 to-teal-500 px-6 py-5 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-lg">Paiement de la réservation</h2>
          </div>
          <p className="text-teal-100 text-sm truncate pl-12">{reservation.space?.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Montant */}
          <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Montant total</p>
              <p className="text-3xl font-extrabold text-teal-700">
                {reservation.totalPrice?.toLocaleString()}
                <span className="text-lg font-semibold text-teal-500 ml-1">MAD</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-teal-600" />
            </div>
          </div>

          {/* Méthode */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Choisissez votre méthode de paiement</p>
            <div className="space-y-2.5">
              {METHODS.map((m) => {
                const isActive = method === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMethod(m.value)}
                    className={`w-full flex items-center gap-4 p-3.5 rounded-2xl border-2 transition-all duration-200 text-left ${isActive ? m.active : "border-gray-100 hover:border-gray-200 bg-white"}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? m.icon_bg : "bg-gray-100 text-gray-400"}`}>
                      <m.Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${isActive ? "text-gray-900" : "text-gray-600"}`}>{m.label}</p>
                      <p className="text-xs text-gray-400">{m.desc}</p>
                    </div>
                    {isActive && <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
            Le propriétaire confirmera la réception du paiement après vérification.
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Envoi…</>
              ) : (
                <>Confirmer le paiement</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
