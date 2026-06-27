import {
  Heart, Mic2, PartyPopper, CheckCircle2, XCircle, Clock, ShieldCheck, Building2, User, Ban, RotateCcw,
  Cake, Gem, Music, BookOpen,
} from "lucide-react";

export const BLOCKED_BADGE = { label: "Bloqué", Icon: Ban, cls: "bg-rose-50 text-rose-700 border border-rose-200" };
export const ACTIVE_BADGE = { label: "Actif", Icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" };

export const TYPE_CONFIG = {
  mariage:      { label: "Mariage",            Icon: Heart },
  conference:   { label: "Conférence",         Icon: Mic2 },
  evenement:    { label: "Événement",          Icon: PartyPopper },
  anniversaire: { label: "Anniversaire",       Icon: Cake },
  fiancailles:  { label: "Fiançailles",        Icon: Gem },
  soiree:       { label: "Soirée / Gala",      Icon: Music },
  seminaire:    { label: "Séminaire",          Icon: BookOpen },
};

export const SPACE_STATUS_BADGE = {
  validated: { label: "Validé", Icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  refused: { label: "Refusé", Icon: XCircle, cls: "bg-rose-50 text-rose-700 border border-rose-200" },
  pending: { label: "En attente", Icon: Clock, cls: "bg-amber-50 text-amber-700 border border-amber-200" },
};

export const ROLE_BADGE = {
  admin: { label: "Admin", Icon: ShieldCheck, cls: "bg-rose-50 text-rose-700 border border-rose-200" },
  owner: { label: "Owner", Icon: Building2, cls: "bg-orange-50 text-orange-700 border border-orange-200" },
  client: { label: "Client", Icon: User, cls: "bg-blue-50 text-blue-700 border border-blue-200" },
};

export const RESERVATION_STATUS_BADGE = {
  pending: { label: "En attente", Icon: Clock, cls: "bg-amber-50 text-amber-700 border border-amber-200" },
  accepted: { label: "Acceptée", Icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  refused: { label: "Refusée", Icon: XCircle, cls: "bg-rose-50 text-rose-700 border border-rose-200" },
  cancelled: { label: "Annulée", Icon: Ban, cls: "bg-gray-100 text-gray-500 border border-gray-200" },
};

export const PAYMENT_STATUS_BADGE = {
  pending: { label: "En attente", Icon: Clock, cls: "bg-amber-50 text-amber-700 border border-amber-200" },
  confirmed: { label: "Confirmé", Icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  cancelled: { label: "Annulé", Icon: XCircle, cls: "bg-gray-100 text-gray-500 border border-gray-200" },
  refunded: { label: "Remboursé", Icon: RotateCcw, cls: "bg-blue-50 text-blue-700 border border-blue-200" },
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
