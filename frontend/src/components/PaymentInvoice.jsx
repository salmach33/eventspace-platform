import { useRef } from "react";
import { X, Building2, CreditCard, Landmark, Wallet, Calendar, MapPin } from "lucide-react";

const METHOD_CONFIG = {
  virement: { label: "Virement bancaire", Icon: Landmark },
  carte:    { label: "Carte bancaire",    Icon: CreditCard },
  cash:     { label: "Espèces",           Icon: Wallet },
};

const STATUS_MAP = {
  pending:   { label: "En attente de validation", color: "#92400e", bg: "#fffbeb", border: "#fde68a", dot: "#f59e0b" },
  confirmed: { label: "Paiement confirmé",         color: "#166534", bg: "#f0fdf4", border: "#86efac", dot: "#22c55e" },
  cancelled: { label: "Paiement annulé",           color: "#374151", bg: "#f9fafb", border: "#d1d5db", dot: "#9ca3af" },
  refunded:  { label: "Paiement remboursé",        color: "#1e40af", bg: "#eff6ff", border: "#93c5fd", dot: "#3b82f6" },
};

export default function PaymentInvoice({ payment, onClose }) {
  const printRef = useRef();
  const reservation = payment.reservation;

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8"/>
        <title>Facture de paiement #${payment._id?.slice(-8).toUpperCase()}</title>
        <style>
          @page { margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; background: white; }
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

  const status = STATUS_MAP[payment.status] || STATUS_MAP.pending;
  const MethodIcon = METHOD_CONFIG[payment.method]?.Icon;
  const refId = payment._id?.slice(-8).toUpperCase();
  const issuedAt = new Date(payment.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 no-print">
          <h2 className="font-bold text-gray-800">Facture de paiement</h2>
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

        {/* Invoice preview */}
        <div ref={printRef}>
          <div style={{ maxWidth: "700px", margin: "0 auto", padding: "40px", fontFamily: "'Segoe UI', Arial, sans-serif", color: "#1a1a2e" }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", paddingBottom: "24px", borderBottom: "3px solid #0d9488" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "22px", fontWeight: "800", color: "#0d9488" }}>
                  <Building2 size={22} /> EventSpace
                </div>
                <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>Plateforme de réservation d'espaces événementiels</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>Facture de paiement</div>
                <div style={{ fontSize: "20px", fontWeight: "800", color: "#0d9488", letterSpacing: "1px" }}>#{refId}</div>
                <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>Émise le {issuedAt}</div>
              </div>
            </div>

            {/* Status */}
            <div style={{ background: status.bg, border: `1px solid ${status.border}`, borderRadius: "10px", padding: "12px 20px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: status.dot, flexShrink: 0 }} />
              <span style={{ fontSize: "14px", fontWeight: "600", color: status.color }}>{status.label}</span>
            </div>

            {/* Montant */}
            <div style={{ background: "#0d9488", color: "white", borderRadius: "10px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <div style={{ fontSize: "13px", opacity: 0.85 }}>Montant payé</div>
                <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "2px" }}>
                  {MethodIcon ? METHOD_CONFIG[payment.method].label : payment.method}
                </div>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "800" }}>{payment.amount?.toLocaleString()} MAD</div>
            </div>

            {/* Parties */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>Parties</div>
              <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "3px" }}>Payé par</div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>{payment.client?.name}</div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>{payment.client?.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "3px" }}>Reçu par</div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>{payment.owner?.name}</div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>{payment.owner?.email}</div>
                </div>
              </div>
            </div>

            {/* Réservation liée */}
            {reservation && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>Réservation associée</div>
                <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "16px 20px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#1f2937" }}>{reservation.space?.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={12} /> {reservation.space?.location?.city}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={12} /> {new Date(reservation.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "6px" }}>Référence réservation #{reservation._id?.slice(-8).toUpperCase()}</div>
                </div>
              </div>
            )}

            {/* Motif si annulé/remboursé */}
            {payment.cancellationReason && ["cancelled", "refunded"].includes(payment.status) && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>Motif</div>
                <div style={{ background: "#fef2f2", borderLeft: "3px solid #f87171", padding: "12px 16px", borderRadius: "0 8px 8px 0", fontSize: "13px", color: "#991b1b", fontStyle: "italic" }}>
                  "{payment.cancellationReason}"
                </div>
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
