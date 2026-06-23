export const STATUS_CONFIG = {
  pending:   { label: "En attente", dot: "bg-amber-500",   text: "text-amber-700" },
  accepted:  { label: "Acceptée",   dot: "bg-emerald-500", text: "text-emerald-700" },
  refused:   { label: "Refusée",    dot: "bg-rose-500",    text: "text-rose-700" },
  cancelled: { label: "Annulée",    dot: "bg-gray-400",    text: "text-gray-500" },
};

export const PAYMENT_STATUS_CONFIG = {
  pending:   { label: "En attente",  dot: "bg-amber-500",   text: "text-amber-700" },
  confirmed: { label: "Confirmé",    dot: "bg-emerald-500", text: "text-emerald-700" },
  cancelled: { label: "Annulé",      dot: "bg-gray-400",    text: "text-gray-500" },
  refunded:  { label: "Remboursé",   dot: "bg-blue-500",    text: "text-blue-700" },
};

export function Badge({ cfg, children }) {
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 border border-gray-200 ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {children || cfg.label}
    </span>
  );
}
