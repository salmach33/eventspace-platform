import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";

const QUICK_REASONS = [
  "Paiement non reçu",
  "Montant incorrect",
  "Référence de virement introuvable",
  "Autre motif",
];

export default function RejectPaymentModal({ payment, onClose, onSuccess }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Le motif du refus est obligatoire");
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.put(`/payments/${payment._id}/reject`, { reason });
      toast.success("Paiement refusé — le client peut effectuer un nouveau paiement");
      onSuccess?.(data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="relative bg-gradient-to-r from-rose-600 to-red-500 px-6 py-5 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-lg">Refuser le paiement</h2>
          </div>
          <p className="text-red-100 text-sm pl-12">{payment.amount?.toLocaleString()} MAD</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Raisons rapides */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Motif rapide</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${reason === r ? "bg-rose-100 border-rose-400 text-rose-700 font-semibold" : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Motif texte */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Détails <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Précisez le motif du refus..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Le client sera notifié et pourra effectuer un nouveau paiement.
            </p>
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
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Envoi…</>
              ) : "Refuser le paiement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
