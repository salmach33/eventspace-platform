import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Building2, MapPin, Calendar, CreditCard, Landmark, Wallet, FileText,
} from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Badge, PAYMENT_STATUS_CONFIG } from "../components/StatusBadge";
import PaymentInvoice from "../components/PaymentInvoice";
import toast from "react-hot-toast";

const METHOD_CONFIG = {
  virement: { label: "Virement bancaire", Icon: Landmark },
  carte:    { label: "Carte bancaire",    Icon: CreditCard },
  cash:     { label: "Espèces",           Icon: Wallet },
};

const PAYMENT_DETAIL_LABELS = {
  pending:   "En attente de validation",
  confirmed: "Paiement confirmé",
  cancelled: "Paiement annulé",
  refunded:  "Paiement remboursé",
};

export default function PaymentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/payments/${id}`);
        setPayment(data);
      } catch (err) {
        toast.error(err.response?.data?.message || "Paiement introuvable");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading || !payment) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const res = payment.reservation;
  const isOwner = user._id === payment.owner?._id;
  const spaceImg = res?.space?.images?.[0] ? `http://localhost:5000${res.space.images[0]}` : null;
  const MethodIcon = METHOD_CONFIG[payment.method]?.Icon;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {showReceipt && (
        <PaymentInvoice payment={payment} onClose={() => setShowReceipt(false)} />
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Détail du paiement</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Espace / réservation liée */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {spaceImg ? (
              <img src={spaceImg} alt="" className="w-full h-56 object-cover" />
            ) : (
              <div className="w-full h-32 bg-teal-50 flex items-center justify-center">
                <Building2 className="w-10 h-10 text-teal-300" />
              </div>
            )}
            <div className="p-6">
              <Link to={`/spaces/${res?.space?._id}`} className="text-lg font-bold text-gray-900 hover:text-teal-600">
                {res?.space?.title}
              </Link>
              <p className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                <MapPin className="w-3.5 h-3.5" /> {res?.space?.location?.address}, {res?.space?.location?.city}
              </p>
              {res?.date && (
                <p className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                  <Calendar className="w-3.5 h-3.5" /> {new Date(res.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}
              {res?._id && (
                <Link to={`/reservations/${res._id}`} className="inline-block mt-3 text-sm text-teal-600 font-semibold hover:underline">
                  Voir la réservation liée
                </Link>
              )}
            </div>
          </div>

          {/* Détails du paiement */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4">Détails du paiement</h2>
            <div className="grid grid-cols-2 gap-5 text-sm">
              <div>
                <div className="text-gray-400 text-xs mb-1">Montant</div>
                <div className="font-semibold text-gray-800">{payment.amount?.toLocaleString()} MAD</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Méthode</div>
                <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                  {MethodIcon && <MethodIcon className="w-3.5 h-3.5 text-gray-400" />}
                  {METHOD_CONFIG[payment.method]?.label || payment.method}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Déclaré le</div>
                <div className="font-semibold text-gray-800">{new Date(payment.createdAt).toLocaleDateString("fr-FR")}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Dernière mise à jour</div>
                <div className="font-semibold text-gray-800">{new Date(payment.updatedAt).toLocaleDateString("fr-FR")}</div>
              </div>
            </div>
            {payment.cancellationReason && ["cancelled", "refunded"].includes(payment.status) && (
              <div className="mt-5 bg-rose-50 border-l-2 border-rose-300 rounded-r-lg px-4 py-3 text-sm text-rose-700 italic">
                Motif : "{payment.cancellationReason}"
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4">{isOwner ? "Client" : "Propriétaire"}</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                {(isOwner ? payment.client?.name : payment.owner?.name)?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{isOwner ? payment.client?.name : payment.owner?.name}</p>
                <p className="text-gray-500 text-sm">{isOwner ? payment.client?.email : payment.owner?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - statut + facture */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24 space-y-6">
            <section>
              <h3 className="text-sm font-bold text-gray-800 mb-3">Statut du paiement</h3>
              <Badge cfg={PAYMENT_STATUS_CONFIG[payment.status]}>
                {PAYMENT_DETAIL_LABELS[payment.status] || PAYMENT_STATUS_CONFIG[payment.status]?.label}
              </Badge>
            </section>

            <div className="border-t border-gray-100 pt-5">
              <button
                onClick={() => setShowReceipt(true)}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-teal-700"
              >
                <FileText className="w-4 h-4" /> Télécharger la facture
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
