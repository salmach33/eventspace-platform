import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Building2, MapPin, Calendar, CreditCard,
  Landmark, Wallet, FileText, CheckCircle2, Clock, XCircle, RotateCcw,
} from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Badge, PAYMENT_STATUS_CONFIG } from "../components/StatusBadge";
import PaymentInvoice from "../components/PaymentInvoice";
import toast from "react-hot-toast";
import { mediaUrl } from "../utils/media";

const METHOD_CONFIG = {
  virement: { label: "Virement bancaire", Icon: Landmark,  bg: "bg-sky-50 text-sky-700" },
  carte:    { label: "Carte bancaire",    Icon: CreditCard, bg: "bg-violet-50 text-violet-700" },
  cash:     { label: "Espèces",           Icon: Wallet,    bg: "bg-emerald-50 text-emerald-700" },
};

const STATUS_STEPS = [
  { key: "pending",   label: "Déclaré",   Icon: Clock,         color: "text-amber-500",  bg: "bg-amber-100" },
  { key: "confirmed", label: "Confirmé",  Icon: CheckCircle2,  color: "text-emerald-500",bg: "bg-emerald-100" },
];

const STATUS_CANCELLED = { key: "cancelled", label: "Annulé",   Icon: XCircle,    color: "text-gray-400",  bg: "bg-gray-100" };
const STATUS_REFUNDED  = { key: "refunded",  label: "Remboursé", Icon: RotateCcw, color: "text-blue-500",  bg: "bg-blue-100" };

function StatusTimeline({ status }) {
  if (status === "cancelled") {
    const S = STATUS_CANCELLED;
    return (
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${S.bg}`}>
        <S.Icon className={`w-5 h-5 ${S.color}`} />
        <span className={`font-semibold text-sm ${S.color}`}>{S.label}</span>
      </div>
    );
  }
  if (status === "refunded") {
    const S = STATUS_REFUNDED;
    return (
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${S.bg}`}>
        <S.Icon className={`w-5 h-5 ${S.color}`} />
        <span className={`font-semibold text-sm ${S.color}`}>{S.label}</span>
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center gap-2">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        return (
          <div key={step.key} className="flex items-center gap-2 flex-1">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${done ? step.bg : "bg-gray-100"}`}>
                <step.Icon className={`w-4 h-4 ${done ? step.color : "text-gray-300"}`} />
              </div>
              <span className={`text-xs font-medium ${done ? "text-gray-700" : "text-gray-300"}`}>{step.label}</span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 ${i < currentIdx ? "bg-emerald-300" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

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
  const spaceImg = mediaUrl(res?.space?.images?.[0]);
  const methodCfg = METHOD_CONFIG[payment.method];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {showReceipt && (
        <PaymentInvoice payment={payment} onClose={() => setShowReceipt(false)} />
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-5">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-3 transition">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Détail du paiement</h1>
              <p className="text-gray-400 text-sm mt-0.5">Référence #{payment._id?.slice(-8).toUpperCase()}</p>
            </div>
            <Badge cfg={PAYMENT_STATUS_CONFIG[payment.status]}>
              {PAYMENT_STATUS_CONFIG[payment.status]?.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-5">

          {/* Espace */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {spaceImg ? (
              <img src={spaceImg} alt="" className="w-full h-52 object-cover" />
            ) : (
              <div className="w-full h-32 bg-teal-50 flex items-center justify-center">
                <Building2 className="w-10 h-10 text-teal-200" />
              </div>
            )}
            <div className="p-5">
              <Link to={`/spaces/${res?.space?._id}`} className="text-lg font-bold text-gray-900 hover:text-teal-600 transition">
                {res?.space?.title}
              </Link>
              <div className="flex flex-wrap gap-3 mt-2">
                {res?.space?.location?.city && (
                  <span className="flex items-center gap-1 text-gray-400 text-sm">
                    <MapPin className="w-3.5 h-3.5" /> {res.space.location.address}, {res.space.location.city}
                  </span>
                )}
                {res?.date && (
                  <span className="flex items-center gap-1 text-gray-400 text-sm">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(res.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                )}
              </div>
              {res?._id && (
                <Link to={`/reservations/${res._id}`} className="inline-block mt-3 text-sm text-teal-600 font-semibold hover:underline">
                  Voir la réservation liée →
                </Link>
              )}
            </div>
          </div>

          {/* Détails */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-800 mb-4">Détails du paiement</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Montant */}
              <div className="col-span-2 flex items-center justify-between bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl px-4 py-3 border border-teal-100">
                <span className="text-sm text-gray-500">Montant</span>
                <span className="text-2xl font-extrabold text-teal-700">{payment.amount?.toLocaleString()} <span className="text-base font-semibold">MAD</span></span>
              </div>

              {/* Méthode */}
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1.5">Méthode</p>
                {methodCfg ? (
                  <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1 rounded-full ${methodCfg.bg}`}>
                    <methodCfg.Icon className="w-3.5 h-3.5" /> {methodCfg.label}
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-gray-700">{payment.method}</span>
                )}
              </div>

              {/* Dates */}
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1.5">Déclaré le</p>
                <p className="text-sm font-semibold text-gray-700">{new Date(payment.createdAt).toLocaleDateString("fr-FR")}</p>
              </div>
            </div>

            {/* Motif annulation */}
            {payment.cancellationReason && ["cancelled", "refunded"].includes(payment.status) && (
              <div className="mt-4 bg-rose-50 border-l-4 border-rose-400 rounded-r-xl px-4 py-3 text-sm text-rose-700">
                <p className="font-semibold mb-0.5">Motif :</p>
                <p className="italic">"{payment.cancellationReason}"</p>
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-800 mb-4">{isOwner ? "Client" : "Propriétaire"}</h2>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                {(isOwner ? payment.client?.name : payment.owner?.name)?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{isOwner ? payment.client?.name : payment.owner?.name}</p>
                <p className="text-gray-400 text-sm">{isOwner ? payment.client?.email : payment.owner?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24 space-y-5">

            {/* Timeline */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-4">Progression du paiement</h3>
              <StatusTimeline status={payment.status} />
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2.5">
              <button
                onClick={() => setShowReceipt(true)}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl text-sm font-bold transition"
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
