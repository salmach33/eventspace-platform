import { useState } from "react";
import { X, XCircle } from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";

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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-red-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold text-lg"><XCircle className="w-5 h-5" /> Refuser le paiement</h2>
            <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <p className="text-red-100 text-sm mt-1">{payment.amount?.toLocaleString()} MAD</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Motif du refus <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex : paiement non reçu, montant incorrect..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Le client sera notifié et pourra effectuer un nouveau paiement.
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
              className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition"
            >
              {loading ? "Envoi..." : "Refuser le paiement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
