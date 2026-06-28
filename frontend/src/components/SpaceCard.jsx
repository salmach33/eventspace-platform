import { Link } from "react-router-dom";
import { Heart, Mic2, PartyPopper, MapPin, Star, Users, Cake, Gem, Music, BookOpen, ArrowRight } from "lucide-react";
import { mediaUrl } from "../utils/media";

const TYPE_CONFIG = {
  mariage:      { label: "Mariage",             Icon: Heart,       badge: "bg-rose-100 text-rose-700",     dot: "bg-rose-500" },
  conference:   { label: "Conférence",          Icon: Mic2,        badge: "bg-sky-100 text-sky-700",       dot: "bg-sky-500" },
  evenement:    { label: "Événement",           Icon: PartyPopper, badge: "bg-amber-100 text-amber-700",   dot: "bg-amber-500" },
  anniversaire: { label: "Anniversaire",        Icon: Cake,        badge: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  fiancailles:  { label: "Fiançailles",         Icon: Gem,         badge: "bg-pink-100 text-pink-700",     dot: "bg-pink-500" },
  soiree:       { label: "Soirée / Gala",       Icon: Music,       badge: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-500" },
  seminaire:    { label: "Séminaire",           Icon: BookOpen,    badge: "bg-teal-100 text-teal-700",     dot: "bg-teal-500" },
};

export default function SpaceCard({ space }) {
  const imgSrc = space.images?.[0]
    ? mediaUrl(space.images[0])
    : "https://via.placeholder.com/400x250?text=Espace";

  const typeCfg = TYPE_CONFIG[space.type];
  const isNew = !space.averageRating || space.averageRating === 0;

  return (
    <Link
      to={`/spaces/${space._id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={imgSrc}
          alt={space.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* type badge */}
        {typeCfg && (
          <div className="absolute top-3 left-3">
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${typeCfg.badge}`}>
              <typeCfg.Icon className="w-3.5 h-3.5" />
              {typeCfg.label}
            </span>
          </div>
        )}

        {/* price overlay */}
        <div className="absolute bottom-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm text-teal-800 font-bold text-sm px-3 py-1 rounded-full shadow">
            {space.price.toLocaleString()} MAD
            <span className="text-gray-500 font-normal text-xs">/jour</span>
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-teal-700 transition-colors">
          {space.title}
        </h3>

        <p className="flex items-center gap-1.5 text-gray-400 text-sm mb-3">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          {space.location.city}, {space.location.country}
        </p>

        <div className="flex items-center justify-between">
          {/* rating */}
          <div className="flex items-center gap-1.5">
            {isNew ? (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Nouveau</span>
            ) : (
              <>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold text-gray-800">{space.averageRating.toFixed(1)}</span>
                {space.reviews?.length > 0 && (
                  <span className="text-gray-400 text-xs">({space.reviews.length} avis)</span>
                )}
              </>
            )}
          </div>

          {/* capacity */}
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Users className="w-3.5 h-3.5" />
            {space.capacity} pers.
          </div>
        </div>

        {/* CTA */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">Voir les disponibilités</span>
          <ArrowRight className="w-4 h-4 text-teal-600 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
