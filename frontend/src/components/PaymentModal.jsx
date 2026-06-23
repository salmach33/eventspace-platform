import { useState } from "react";
import { X, CreditCard } from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";

const METHODS = [
  { value: "virement", label: "Virement bancaire" },
  { value: "carte", label: "Carte bancaire" },
  { value: "cash", label: "Espèces" },
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
      toast.success("Paiement déclaré, en attente de confirmation du propriétaire", { icon: <CreditCard className="w-4 h-4 text-teal-600" /> });
      onSuccess?.(data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors du paiement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-teal-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold text-lg"><CreditCard className="w-5 h-5" /> Paiement de la réservation</h2>
            <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <p className="text-teal-200 text-sm mt-1">{reservation.space?.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Montant */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Montant à payer</label>
            <div className="flex items-center justify-between bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
              <span className="text-gray-500 text-sm">Total réservation</span>
              <span className="text-2xl font-extrabold text-teal-600">
                {reservation.totalPrice?.toLocaleString()} MAD
              </span>
            </div>
          </div>

          {/* Méthode de paiement */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Méthode de paiement</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
            >
              {METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Statut */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Statut du paiement</label>
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 flex-shrink-0" />
              <span className="text-sm font-semibold text-yellow-700">En attente de confirmation par le propriétaire</span>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Le propriétaire confirmera la réception du paiement après vérification.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-teal-600 text-white py-2.5 rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-50 transition"
            >
              {loading ? "Envoi..." : "Confirmer le paiement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
