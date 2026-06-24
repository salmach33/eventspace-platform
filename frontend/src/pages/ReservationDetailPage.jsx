import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Building2, MapPin, Calendar, Users, CreditCard, Landmark, Wallet,
  MessageCircle, FileText,
} from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Badge, STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from "../components/StatusBadge";
import PaymentModal from "../components/PaymentModal";
import RejectPaymentModal from "../components/RejectPaymentModal";
import ReservationReceipt from "../components/ReservationReceipt";
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

export default function ReservationDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: res } = await API.get(`/reservations/${id}`);
      setReservation(res);
      try {
        const { data: pay } = await API.get(`/payments/reservation/${id}`);
        setPayment(pay);
      } catch {
        setPayment(null);
      }
    } catch {
      toast.error("Réservation introuvable");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  if (loading || !reservation) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const res = reservation;
  const isOwner = user._id === res.owner?._id;
  const isAdmin = user.role === "admin";
  const spaceImg = res.space?.images?.[0] ? `http://localhost:5000${res.space.images[0]}` : null;
  const canPay = !payment || payment.status === "cancelled";
  const MethodIcon = payment ? METHOD_CONFIG[payment.method]?.Icon : null;

  const handleStatusChange = async (status) => {
    try {
      await API.put(`/reservations/${id}/status`, { status });
      toast.success(status === "accepted" ? "Réservation acceptée" : "Réservation refusée");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  const handleCancelReservation = async () => {
    if (!confirm("Confirmer l'annulation ?")) return;
    try {
      await API.put(`/reservations/${id}/status`, { status: "cancelled" });
      toast.success("Réservation annulée");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  const handleCancelPayment = async () => {
    if (!confirm("Annuler ce paiement ?")) return;
    try {
      await API.put(`/payments/${payment._id}/cancel`);
      toast.success("Paiement annulé");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  const handleConfirmPayment = async () => {
    try {
      await API.put(`/payments/${payment._id}/confirm`);
      toast.success("Réception du paiement confirmée");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {showPaymentModal && (
        <PaymentModal reservation={res} onClose={() => setShowPaymentModal(false)} onSuccess={fetchData} />
      )}
      {showRejectModal && payment && (
        <RejectPaymentModal payment={payment} onClose={() => setShowRejectModal(false)} onSuccess={fetchData} />
      )}
      {showReceipt && (
        <ReservationReceipt reservation={res} payment={payment} onClose={() => setShowReceipt(false)} />
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Détail de la réservation</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Espace */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {spaceImg ? (
              <img src={spaceImg} alt="" className="w-full h-56 object-cover" />
            ) : (
              <div className="w-full h-32 bg-teal-50 flex items-center justify-center">
                <Building2 className="w-10 h-10 text-teal-300" />
              </div>
            )}
            <div className="p-6">
              <Link to={`/spaces/${res.space?._id}`} className="text-lg font-bold text-gray-900 hover:text-teal-600">
                {res.space?.title}
              </Link>
              <p className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                <MapPin className="w-3.5 h-3.5" /> {res.space?.location?.address}, {res.space?.location?.city}
              </p>
            </div>
          </div>

          {/* Détails réservation */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4">Détails de la réservation</h2>
            <div className="grid grid-cols-2 gap-5 text-sm">
              <div>
                <div className="text-gray-400 text-xs mb-1">Date</div>
                <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" /> {new Date(res.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Invités</div>
                <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                  <Users className="w-3.5 h-3.5 text-gray-400" /> {res.guestCount} personnes
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Montant total</div>
                <div className="font-semibold text-gray-800">{res.totalPrice?.toLocaleString()} MAD</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Réservée le</div>
                <div className="font-semibold text-gray-800">{new Date(res.createdAt).toLocaleDateString("fr-FR")}</div>
              </div>
            </div>
            {res.message && (
              <div className="mt-5 bg-amber-50 border-l-2 border-amber-300 rounded-r-lg px-4 py-3 text-sm text-amber-800 italic">
                "{res.message}"
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4">{isOwner ? "Client" : "Propriétaire"}</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                {(isOwner ? res.client?.name : res.owner?.name)?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{isOwner ? res.client?.name : res.owner?.name}</p>
                <p className="text-gray-500 text-sm">{isOwner ? res.client?.email : res.owner?.email}</p>
                {(isOwner ? res.client?.phone : res.owner?.phone) && (
                  <p className="text-gray-500 text-sm">{isOwner ? res.client?.phone : res.owner?.phone}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - statut, paiement, actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24 space-y-6">
            {/* Statut de la réservation */}
            <section>
              <h3 className="text-sm font-bold text-gray-800 mb-3">Statut de la réservation</h3>
              <Badge cfg={STATUS_CONFIG[res.status]} />
            </section>

            {/* Paiement */}
            <section className="border-t border-gray-100 pt-5">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Paiement</h3>
              {payment ? (
                <>
                  <Badge cfg={PAYMENT_STATUS_CONFIG[payment.status]}>
                    {PAYMENT_DETAIL_LABELS[payment.status] || PAYMENT_STATUS_CONFIG[payment.status]?.label}
                  </Badge>
                  <div className="text-sm bg-gray-50 rounded-xl p-3 mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Montant</span>
                      <span className="font-semibold text-gray-800">{payment.amount?.toLocaleString()} MAD</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Méthode</span>
                      <span className="flex items-center gap-1.5 font-semibold text-gray-800">
                        {MethodIcon && <MethodIcon className="w-3.5 h-3.5" />}
                        {METHOD_CONFIG[payment.method]?.label || payment.method}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Déclaré le</span>
                      <span className="font-semibold text-gray-800">{new Date(payment.createdAt).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>
                  {payment.cancellationReason && ["cancelled", "refunded"].includes(payment.status) && (
                    <p className="text-sm text-rose-500 italic mt-2">Motif : "{payment.cancellationReason}"</p>
                  )}
                  <Link to={`/payments/${payment._id}`} className="inline-block text-sm text-teal-600 font-semibold hover:underline mt-3">
                    Voir le détail du paiement
                  </Link>
                </>
              ) : (
                <p className="text-sm text-gray-400">Aucun paiement effectué pour le moment</p>
              )}
            </section>

            <div className="border-t border-gray-100 pt-5 flex flex-col gap-2">
              {!isAdmin && isOwner && res.status === "pending" && (
                <>
                  <button onClick={() => handleStatusChange("accepted")} className="bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700">
                    Accepter
                  </button>
                  <button onClick={() => handleStatusChange("refused")} className="border border-rose-300 text-rose-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-rose-50">
                    Refuser
                  </button>
                </>
              )}
              {!isAdmin && !isOwner && res.status === "pending" && (
                <button onClick={handleCancelReservation} className="border border-rose-300 text-rose-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-rose-50">
                  Annuler la réservation
                </button>
              )}
              {!isAdmin && !isOwner && res.status === "accepted" && canPay && (
                <button onClick={() => setShowPaymentModal(true)} className="flex items-center justify-center gap-2 bg-teal-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-teal-700">
                  <CreditCard className="w-4 h-4" /> {payment ? "Payer à nouveau" : "Payer maintenant"}
                </button>
              )}
              {!isAdmin && !isOwner && payment?.status === "pending" && (
                <button onClick={handleCancelPayment} className="border border-rose-300 text-rose-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-rose-50">
                  Annuler le paiement
                </button>
              )}
              {!isAdmin && isOwner && payment?.status === "pending" && (
                <>
                  <button onClick={handleConfirmPayment} className="bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700">
                    Confirmer réception
                  </button>
                  <button onClick={() => setShowRejectModal(true)} className="border border-rose-300 text-rose-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-rose-50">
                    Refuser le paiement
                  </button>
                </>
              )}
              {!isAdmin && isOwner && res.status === "accepted" && (
                <button onClick={handleCancelReservation} className="border border-rose-300 text-rose-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-rose-50">
                  Annuler la réservation
                </button>
              )}
              {!isAdmin && (
                <Link
                  to={`/messages?spaceId=${res.space?._id}&ownerId=${isOwner ? res.client?._id : res.owner?._id}`}
                  className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50"
                >
                  <MessageCircle className="w-4 h-4" /> Message
                </Link>
              )}
              <button onClick={() => setShowReceipt(true)} className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50">
                <FileText className="w-4 h-4" /> Reçu PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
