import { AlertTriangle, Trash2, XCircle } from "lucide-react";

const VARIANTS = {
  danger:  { icon: Trash2,         bg: "bg-rose-600",   hover: "hover:bg-rose-700",   iconBg: "bg-rose-100",   iconColor: "text-rose-600" },
  warning: { icon: AlertTriangle,  bg: "bg-amber-500",  hover: "hover:bg-amber-600",  iconBg: "bg-amber-100",  iconColor: "text-amber-600" },
  default: { icon: XCircle,        bg: "bg-teal-600",   hover: "hover:bg-teal-700",   iconBg: "bg-teal-100",   iconColor: "text-teal-600" },
};

export default function ConfirmModal({
  message,
  description,
  confirmLabel = "Confirmer",
  cancelLabel  = "Annuler",
  variant      = "danger",
  onConfirm,
  onCancel,
}) {
  const v = VARIANTS[variant] || VARIANTS.default;
  const Icon = v.icon;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center ${v.iconBg}`}>
            <Icon className={`w-7 h-7 ${v.iconColor}`} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{message}</h3>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
        <div className="flex border-t border-gray-100">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition border-r border-gray-100"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3.5 text-sm font-bold text-white transition ${v.bg} ${v.hover}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
