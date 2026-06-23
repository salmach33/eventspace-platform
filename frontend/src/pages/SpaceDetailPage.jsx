import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star, MapPin, Users, MessageCircle, Calendar, Building2, Eye, CreditCard,
  Wifi, ParkingCircle, Snowflake, CookingPot, Drama, Volume2, Projector, Armchair, Check,
} from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import AvailabilityCalendar from "../components/AvailabilityCalendar";
import PaymentModal from "../components/PaymentModal";
import { Badge, STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from "../components/StatusBadge";
import toast from "react-hot-toast";

const EQUIP_ICONS = {
  WiFi: Wifi, Parking: ParkingCircle, Climatisation: Snowflake, Cuisine: CookingPot,
  Scène: Drama, Sono: Volume2, Projecteur: Projector, Tables: Armchair,
};

export default function SpaceDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [space, setSpace] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);

  // Reservation form
  const [resForm, setResForm] = useState({ date: "", guestCount: 1, message: "" });
  const [resLoading, setResLoading] = useState(false);
  const [calendarKey, setCalendarKey] = useState(0); // force refresh calendar after booking

  // Mes réservations + paiements pour cet espace
  const [myReservations, setMyReservations] = useState([]);
  const [myPayments, setMyPayments] = useState([]);
  const [payingReservation, setPayingReservation] = useState(null);

  // Review form
  const [revForm, setRevForm] = useState({ rating: 5, comment: "" });
  const [revLoading, setRevLoading] = useState(false);

  useEffect(() => {
    API.get(`/spaces/${id}`)
      .then(({ data }) => setSpace(data))
      .catch(() => toast.error("Espace introuvable"))
      .finally(() => setLoading(false));
  }, [id]);

  const fetchMyData = async () => {
    if (!user || user.role !== "client") return;
    try {
      const [{ data: reservations }, { data: payments }] = await Promise.all([
        API.get("/reservations/my"),
        API.get("/payments/my"),
      ]);
      setMyReservations(reservations.filter((r) => r.space?._id === id));
      setMyPayments(payments);
    } catch {
      // silencieux — section optionnelle
    }
  };

  useEffect(() => { fetchMyData(); }, [id, user]);

  const handleCancelPayment = async (paymentId) => {
    if (!confirm("Annuler ce paiement ?")) return;
    try {
      await API.put(`/payments/${paymentId}/cancel`);
      toast.success("Paiement annulé");
      fetchMyData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  const paymentByReservation = {};
  myPayments.forEach((p) => {
    const resId = p.reservation?._id || p.reservation;
    // payments triés du plus récent au plus ancien — on ne garde que le 1er rencontré par réservation
    if (!paymentByReservation[resId]) paymentByReservation[resId] = p;
  });

  const handleSelectDate = (date) => {
    const isoDate = date.toLocaleDateString("en-CA"); // YYYY-MM-DD format, timezone-safe
    setResForm({ ...resForm, date: isoDate });
  };

  const handleReservation = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    if (!resForm.date) {
      toast.error("Veuillez sélectionner une date dans le calendrier");
      return;
    }
    setResLoading(true);
    try {
      await API.post("/reservations", { spaceId: id, ...resForm });
      toast.success("Réservation envoyée ! En attente de confirmation.");
      setResForm({ date: "", guestCount: 1, message: "" });
      setCalendarKey((k) => k + 1); // refresh calendar to show new pending date
      fetchMyData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la réservation");
    } finally {
      setResLoading(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    setRevLoading(true);
    try {
      const { data } = await API.post(`/spaces/${id}/reviews`, revForm);
      setSpace((prev) => ({ ...prev, reviews: data }));
      toast.success("Avis publié !");
      setRevForm({ rating: 5, comment: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    } finally {
      setRevLoading(false);
    }
  };

  const handleContact = () => {
    if (!user) return navigate("/login");
    navigate(`/messages?spaceId=${id}&ownerId=${space.owner._id}`);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!space) return <div className="text-center py-20 text-gray-500">Espace introuvable</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {payingReservation && (
        <PaymentModal
          reservation={payingReservation}
          onClose={() => setPayingReservation(null)}
          onSuccess={fetchMyData}
        />
      )}

      {/* Image gallery */}
      <div className="bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <img
              src={space.images?.[activeImg] ? `http://localhost:5000${space.images[activeImg]}` : "https://via.placeholder.com/900x400?text=Espace"}
              alt={space.title}
              className="w-full h-80 md:h-[420px] object-cover"
            />
          </div>
          {space.images?.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto">
              {space.images.map((img, i) => (
                <img
                  key={i}
                  src={`http://localhost:5000${img}`}
                  onClick={() => setActiveImg(i)}
                  className={`h-16 w-24 object-cover rounded-lg cursor-pointer flex-shrink-0 ${i === activeImg ? "ring-2 ring-teal-400 opacity-100" : "opacity-60 hover:opacity-80"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT - Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-800">{space.title}</h1>
              <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-semibold text-gray-700">
                  {space.averageRating > 0 ? space.averageRating.toFixed(1) : "Nouveau"}
                </span>
                <span className="text-gray-400 text-sm">({space.reviews?.length || 0})</span>
              </div>
            </div>
            <p className="flex items-center gap-1.5 text-gray-500 mb-4">
              <MapPin className="w-4 h-4" /> {space.location.address}, {space.location.city}
            </p>
            {space.description && <p className="text-gray-600 leading-relaxed">{space.description}</p>}

            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1.5 bg-teal-50 text-teal-700 px-3 py-1 rounded-full">
                <Users className="w-4 h-4" /> {space.capacity} personnes
              </span>
              <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full font-semibold">
                {space.price.toLocaleString()} MAD/jour
              </span>
            </div>
          </div>

          {/* Equipements */}
          {space.equipements?.length > 0 && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="font-bold text-gray-800 text-lg mb-4">Équipements</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {space.equipements.map((eq, i) => {
                  const EquipIcon = EQUIP_ICONS[eq] || Check;
                  return (
                    <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                      <EquipIcon className="w-4 h-4 text-teal-600" />
                      <span className="text-sm text-gray-700">{eq}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Owner info */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-bold text-gray-800 text-lg mb-4">Propriétaire</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                {space.owner?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{space.owner?.name}</p>
                <p className="text-gray-500 text-sm">{space.owner?.email}</p>
              </div>
            </div>
            {user && user._id !== space.owner?._id && (
              <button
                onClick={handleContact}
                className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-teal-600 text-teal-600 py-2 rounded-lg font-semibold hover:bg-teal-50 transition"
              >
                <MessageCircle className="w-4 h-4" /> Contacter le propriétaire
              </button>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-bold text-gray-800 text-lg mb-4">Avis et notes</h2>

            {user && user.role === "client" && (
              <form onSubmit={handleReview} className="mb-6 bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Laisser un avis</h3>
                <div className="flex gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRevForm({ ...revForm, rating: star })}
                      className={star <= revForm.rating ? "text-amber-400" : "text-gray-300"}
                    >
                      <Star className="w-7 h-7 fill-current" />
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Votre commentaire..."
                  value={revForm.comment}
                  onChange={(e) => setRevForm({ ...revForm, comment: e.target.value })}
                  required
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <button
                  type="submit"
                  disabled={revLoading}
                  className="mt-2 bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50 transition"
                >
                  {revLoading ? "Envoi..." : "Publier l'avis"}
                </button>
              </form>
            )}

            {space.reviews?.length === 0 ? (
              <p className="text-gray-400 text-center py-6">Aucun avis pour le moment</p>
            ) : (
              <div className="space-y-4">
                {space.reviews.map((r, i) => (
                  <div key={i} className="border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {r.client?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 text-sm">{r.client?.name}</p>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`w-3.5 h-3.5 ${star <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-gray-400 text-xs ml-auto">
                        {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm ml-11">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT - Reservation */}
        <div className="lg:col-span-1 space-y-6">
          {myReservations.length > 0 && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="font-bold text-gray-800 text-lg mb-4">Mes réservations pour cet espace</h2>
              <div className="space-y-4">
                {myReservations.map((res) => {
                  const payment = paymentByReservation[res._id];
                  return (
                    <div key={res._id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <span className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Calendar className="w-3.5 h-3.5" /> {new Date(res.date).toLocaleDateString("fr-FR")}
                        </span>
                        <Badge cfg={STATUS_CONFIG[res.status]} />
                      </div>
                      {payment && (
                        <div className="mb-2">
                          <Badge cfg={PAYMENT_STATUS_CONFIG[payment.status]} />
                        </div>
                      )}
                      {payment?.cancellationReason && ["cancelled", "refunded"].includes(payment.status) && (
                        <p className="text-xs text-rose-500 mb-2 italic">Motif : "{payment.cancellationReason}"</p>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => navigate(`/reservations/${res._id}`)}
                          className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50"
                        >
                          <Eye className="w-3.5 h-3.5" /> Voir
                        </button>
                        {res.status === "accepted" && (!payment || payment.status === "cancelled") && (
                          <button
                            onClick={() => setPayingReservation(res)}
                            className="flex items-center gap-1.5 bg-teal-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-teal-700"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> {payment ? "Payer à nouveau" : "Payer"}
                          </button>
                        )}
                        {payment?.status === "pending" && (
                          <button
                            onClick={() => handleCancelPayment(payment._id)}
                            className="border border-rose-300 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-rose-50"
                          >
                            Annuler le paiement
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {user?.role === "owner" ? (
            <div className="bg-white rounded-2xl shadow p-6 sticky top-24 text-center">
              <Building2 className="w-9 h-9 mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500 text-sm">
                Les propriétaires ne peuvent pas réserver d'espace. Cette section est réservée aux clients.
              </p>
            </div>
          ) : (
          <div className="bg-white rounded-2xl shadow p-6 sticky top-24">
            <div className="text-center mb-6">
              <span className="text-3xl font-extrabold text-teal-600">{space.price.toLocaleString()}</span>
              <span className="text-gray-400"> MAD/jour</span>
            </div>

            <form onSubmit={handleReservation} className="space-y-4">
              {/* Calendrier de disponibilité */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Choisissez une date disponible
                </label>
                <AvailabilityCalendar
                  key={calendarKey}
                  spaceId={id}
                  selectedDate={resForm.date}
                  onSelectDate={handleSelectDate}
                />
                {resForm.date && (
                  <p className="flex items-center gap-1.5 text-xs text-teal-600 mt-2 font-medium">
                    <Calendar className="w-3.5 h-3.5" /> Date sélectionnée : {new Date(resForm.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Nombre de personnes</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={space.capacity}
                  value={resForm.guestCount}
                  onChange={(e) => setResForm({ ...resForm, guestCount: e.target.value })}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <p className="text-gray-400 text-xs mt-1">Max: {space.capacity} personnes</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Message (optionnel)</label>
                <textarea
                  rows={3}
                  placeholder="Décrivez votre événement..."
                  value={resForm.message}
                  onChange={(e) => setResForm({ ...resForm, message: e.target.value })}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                />
              </div>

              {resForm.date && (
                <div className="bg-teal-50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-bold text-teal-600">{space.price.toLocaleString()} MAD</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={resLoading || !resForm.date}
                className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {resLoading ? "Envoi..." : user ? "Réserver maintenant" : "Se connecter pour réserver"}
              </button>
            </form>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
