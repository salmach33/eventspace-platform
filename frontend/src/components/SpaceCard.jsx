import { Link } from "react-router-dom";
import { Heart, Mic2, PartyPopper, MapPin, Star, Users } from "lucide-react";

const TYPE_CONFIG = {
  mariage:    { label: "Mariage",    Icon: Heart,       badge: "bg-rose-50 text-rose-700" },
  conference: { label: "Conférence", Icon: Mic2,        badge: "bg-sky-50 text-sky-700" },
  evenement:  { label: "Événement",  Icon: PartyPopper, badge: "bg-amber-50 text-amber-700" },
};

export default function SpaceCard({ space }) {
  const imgSrc = space.images?.[0]
    ? `http://localhost:5000${space.images[0]}`
    : "https://via.placeholder.com/400x250?text=Espace";

  const typeCfg = TYPE_CONFIG[space.type];

  return (
    <Link to={`/spaces/${space._id}`} className="group block bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all duration-300">
      <div className="relative overflow-hidden h-48">
        <img
          src={imgSrc}
          alt={space.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {typeCfg && (
          <div className="absolute top-3 left-3">
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${typeCfg.badge}`}>
              <typeCfg.Icon className="w-3.5 h-3.5" />
              {typeCfg.label}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">{space.title}</h3>
        <p className="flex items-center gap-1 text-gray-500 text-sm mb-2">
          <MapPin className="w-3.5 h-3.5" /> {space.location.city}, {space.location.country}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-medium text-gray-700">
              {space.averageRating > 0 ? space.averageRating.toFixed(1) : "Nouveau"}
            </span>
            {space.reviews?.length > 0 && (
              <span className="text-gray-400 text-xs">({space.reviews.length})</span>
            )}
          </div>
          <div>
            <span className="font-bold text-teal-700 text-lg">{space.price.toLocaleString()}</span>
            <span className="text-gray-400 text-sm"> MAD/jour</span>
          </div>
        </div>
        <p className="flex items-center gap-1 text-gray-400 text-xs mt-2">
          <Users className="w-3.5 h-3.5" /> Capacité: {space.capacity} personnes
        </p>
      </div>
    </Link>
  );
}
