import { useEffect, useRef } from "react";
import { X, Building2, MapPin, Calendar, Users, CreditCard, Heart, Mic2, PartyPopper } from "lucide-react";

const PAYMENT_STATUS_MAP = {
  pending:   { label: "Paiement en attente de confirmation", color: "#92400e", bg: "#fffbeb", border: "#fde68a" },
  confirmed: { label: "Paiement reçu et confirmé",            color: "#166534", bg: "#f0fdf4", border: "#86efac" },
  cancelled: { label: "Paiement annulé",                       color: "#374151", bg: "#f9fafb", border: "#d1d5db" },
  refunded:  { label: "Paiement remboursé",                    color: "#1e40af", bg: "#eff6ff", border: "#93c5fd" },
};

const TYPE_ICONS = { mariage: Heart, conference: Mic2, evenement: PartyPopper };

export default function ReservationReceipt({ reservation, payment, onClose }) {
  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8"/>
        <title>Reçu de réservation #${reservation._id?.slice(-8).toUpperCase()}</title>
        <style>
          @page { margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; background: white; }
          .receipt { max-width: 700px; margin: 0 auto; padding: 40px; }

          /* Header */
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 3px solid #0d9488; }
          .logo { font-size: 22px; font-weight: 800; color: #0d9488; }
          .logo span { display: block; font-size: 11px; font-weight: 400; color: #6b7280; margin-top: 2px; }
          .receipt-id { text-align: right; }
          .receipt-id h2 { font-size: 14px; color: #6b7280; font-weight: 500; }
          .receipt-id .id { font-size: 20px; font-weight: 800; color: #0d9488; letter-spacing: 1px; }

          /* Status badge */
          .status-bar { background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px; padding: 12px 20px; margin-bottom: 28px; display: flex; align-items: center; gap: 10px; }
          .status-bar.pending { background: #fffbeb; border-color: #fde68a; }
          .status-bar.refused { background: #fef2f2; border-color: #fca5a5; }
          .status-bar.cancelled { background: #f9fafb; border-color: #d1d5db; }
          .status-dot { width: 10px; height: 10px; border-radius: 50%; background: #22c55e; flex-shrink: 0; }
          .status-dot.pending { background: #f59e0b; }
          .status-dot.refused, .status-dot.cancelled { background: #ef4444; }
          .status-text { font-size: 14px; font-weight: 600; color: #166534; }
          .status-text.pending { color: #92400e; }
          .status-text.refused, .status-text.cancelled { color: #991b1b; }

          /* Sections */
          .section { margin-bottom: 24px; }
          .section-title { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
          .card { background: #f8fafc; border-radius: 10px; padding: 16px 20px; }

          /* Info grid */
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .info-item label { font-size: 11px; color: #9ca3af; display: block; margin-bottom: 3px; }
          .info-item value, .info-item p { font-size: 14px; font-weight: 600; color: #1f2937; }

          /* Space info */
          .space-card { display: flex; gap: 16px; align-items: center; }
          .space-icon { width: 48px; height: 48px; background: #ccfbf1; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
          .space-name { font-size: 18px; font-weight: 700; color: #1f2937; }
          .space-meta { font-size: 13px; color: #6b7280; margin-top: 3px; }

          /* Price box */
          .price-box { background: #0d9488; color: white; border-radius: 10px; padding: 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
          .price-label { font-size: 13px; opacity: 0.85; }
          .price-amount { font-size: 28px; font-weight: 800; }
          .price-sub { font-size: 11px; opacity: 0.7; margin-top: 2px; }

          /* Footer */
          .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
          .footer-brand { font-size: 12px; color: #9ca3af; }
          .footer-date { font-size: 12px; color: #9ca3af; }

          /* Message */
          .message-box { background: #fffbeb; border-left: 3px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 13px; color: #78350f; font-style: italic; }

          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); }, 300);
  };

  const STATUS_MAP = {
    pending:   { label: "En attente de confirmation", cls: "pending" },
    accepted:  { label: "Réservation confirmée", cls: "" },
    refused:   { label: "Réservation refusée", cls: "refused" },
    cancelled: { label: "Réservation annulée", cls: "cancelled" },
  };

  const TYPE_MAP = {
    mariage: "Salle Mariage",
    conference: "Salle Conférence",
    evenement: "Salle Événement",
  };

  const status = STATUS_MAP[reservation.status] || STATUS_MAP.pending;
  const SpaceTypeIcon = TYPE_ICONS[reservation.space?.type] || PartyPopper;
  const refId = reservation._id?.slice(-8).toUpperCase();
  const date = new Date(reservation.date).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
  const createdAt = new Date(reservation.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Reçu de réservation</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Télécharger PDF
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Receipt preview */}
        <div ref={printRef}>
          <div className="receipt" style={{ maxWidth: "700px", margin: "0 auto", padding: "40px", fontFamily: "'Segoe UI', Arial, sans-serif", color: "#1a1a2e" }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", paddingBottom: "24px", borderBottom: "3px solid #0d9488" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "22px", fontWeight: "800", color: "#0d9488" }}>
                  <Building2 size={22} /> EventSpace
                </div>
                <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>Plateforme de réservation d'espaces événementiels</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>Référence de réservation</div>
                <div style={{ fontSize: "20px", fontWeight: "800", color: "#0d9488", letterSpacing: "1px" }}>#{refId}</div>
                <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>Émis le {createdAt}</div>
              </div>
            </div>

            {/* Status */}
            <div style={{ background: reservation.status === "accepted" ? "#f0fdf4" : reservation.status === "pending" ? "#fffbeb" : "#fef2f2", border: `1px solid ${reservation.status === "accepted" ? "#86efac" : reservation.status === "pending" ? "#fde68a" : "#fca5a5"}`, borderRadius: "10px", padding: "12px 20px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: reservation.status === "accepted" ? "#22c55e" : reservation.status === "pending" ? "#f59e0b" : "#ef4444", flexShrink: 0 }} />
              <span style={{ fontSize: "14px", fontWeight: "600", color: reservation.status === "accepted" ? "#166534" : reservation.status === "pending" ? "#92400e" : "#991b1b" }}>
                {status.label}
              </span>
            </div>

            {/* Space info */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>Espace réservé</div>
              <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "16px 20px", display: "flex", gap: "16px", alignItems: "center" }}>
                <div style={{ width: "48px", height: "48px", background: "#ccfbf1", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#0d9488" }}>
                  <SpaceTypeIcon size={22} />
                </div>
                <div>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "#1f2937" }}>{reservation.space?.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#6b7280", marginTop: "3px" }}>
                    {TYPE_MAP[reservation.space?.type]} · <MapPin size={12} /> {reservation.space?.location?.city}
                  </div>
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>Détails de la réservation</div>
              <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "16px 20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "3px" }}>Date de l'événement</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>
                      <Calendar size={14} /> {date}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "3px" }}>Nombre de personnes</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>
                      <Users size={14} /> {reservation.guestCount} personnes
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "3px" }}>Client</div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>{reservation.client?.name}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>{reservation.client?.email}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "3px" }}>Propriétaire</div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>{reservation.owner?.name}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>{reservation.owner?.email}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Message */}
            {reservation.message && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>Message</div>
                <div style={{ background: "#fffbeb", borderLeft: "3px solid #f59e0b", padding: "12px 16px", borderRadius: "0 8px 8px 0", fontSize: "13px", color: "#78350f", fontStyle: "italic" }}>
                  "{reservation.message}"
                </div>
              </div>
            )}

            {/* Price */}
            <div style={{ background: "#0d9488", color: "white", borderRadius: "10px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <div style={{ fontSize: "13px", opacity: 0.85 }}>Montant total</div>
                <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "2px" }}>Prix pour 1 jour</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "28px", fontWeight: "800" }}>{reservation.totalPrice?.toLocaleString()} MAD</div>
              </div>
            </div>

            {/* Payment status */}
            {payment && (
              <div style={{ background: PAYMENT_STATUS_MAP[payment.status]?.bg, border: `1px solid ${PAYMENT_STATUS_MAP[payment.status]?.border}`, borderRadius: "10px", padding: "12px 20px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", color: PAYMENT_STATUS_MAP[payment.status]?.color }}>
                  <CreditCard size={14} /> {PAYMENT_STATUS_MAP[payment.status]?.label}
                </span>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                  {new Date(payment.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
            )}

            {/* Footer */}
            <div style={{ marginTop: "32px", paddingTop: "20px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#9ca3af" }}>
                <Building2 size={12} /> EventSpace — Plateforme de réservation d'espaces événementiels
              </div>
              <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                Document généré le {new Date().toLocaleDateString("fr-FR")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
