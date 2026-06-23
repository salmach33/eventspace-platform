import {
  Heart, Mic2, PartyPopper, CheckCircle2, XCircle, Clock, ShieldCheck, Building2, User, Ban, RotateCcw,
} from "lucide-react";

export const TYPE_CONFIG = {
  mariage: { label: "Mariage", Icon: Heart },
  conference: { label: "Conférence", Icon: Mic2 },
  evenement: { label: "Événement", Icon: PartyPopper },
};

export const SPACE_STATUS_BADGE = {
  validated: { label: "Validé", Icon: CheckCircle2, cls: "bg-green-500/20 text-green-400 border border-green-500/30" },
  refused: { label: "Refusé", Icon: XCircle, cls: "bg-red-500/20 text-red-400 border border-red-500/30" },
  pending: { label: "En attente", Icon: Clock, cls: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" },
};

export const ROLE_BADGE = {
  admin: { label: "Admin", Icon: ShieldCheck, cls: "bg-red-500/20 text-red-400 border border-red-500/30" },
  owner: { label: "Owner", Icon: Building2, cls: "bg-orange-500/20 text-orange-400 border border-orange-500/30" },
  client: { label: "Client", Icon: User, cls: "bg-blue-500/20 text-blue-400 border border-blue-500/30" },
};

export const RESERVATION_STATUS_BADGE = {
  pending: { label: "En attente", Icon: Clock, cls: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" },
  accepted: { label: "Acceptée", Icon: CheckCircle2, cls: "bg-green-500/20 text-green-400 border border-green-500/30" },
  refused: { label: "Refusée", Icon: XCircle, cls: "bg-red-500/20 text-red-400 border border-red-500/30" },
  cancelled: { label: "Annulée", Icon: Ban, cls: "bg-gray-500/20 text-gray-400 border border-gray-500/30" },
};

export const PAYMENT_STATUS_BADGE = {
  pending: { label: "En attente", Icon: Clock, cls: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" },
  confirmed: { label: "Confirmé", Icon: CheckCircle2, cls: "bg-green-500/20 text-green-400 border border-green-500/30" },
  cancelled: { label: "Annulé", Icon: XCircle, cls: "bg-gray-500/20 text-gray-400 border border-gray-500/30" },
  refunded: { label: "Remboursé", Icon: RotateCcw, cls: "bg-blue-500/20 text-blue-400 border border-blue-500/30" },
};

export const PAYMENT_METHOD_LABEL = {
  cash: "Espèces",
  virement: "Virement",
  carte: "Carte",
};

export function Badge({ cfg }) {
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${cfg.cls}`}>
      <cfg.Icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
}
