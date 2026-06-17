import { Link } from "react-router-dom";

const TYPE_LABELS = {
  mariage: "💍 Mariage",
  conference: "🎤 Conférence",
  evenement: "🎉 Événement",
};

const TYPE_COLORS = {
  mariage: "bg-pink-100 text-pink-700",
  conference: "bg-blue-100 text-blue-700",
  evenement: "bg-purple-100 text-purple-700",
};

export default function SpaceCard({ space }) {
  const imgSrc = space.images?.[0]
    ? `http://localhost:5000${space.images[0]}`
    : "https://via.placeholder.com/400x250?text=Espace";

  return (
    <Link to={`/spaces/${space._id}`} className="group block bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all duration-300">
      <div className="relative overflow-hidden h-48">
        <img
          src={imgSrc}
          alt={space.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${TYPE_COLORS[space.type]}`}>
            {TYPE_LABELS[space.type]}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">{space.title}</h3>
        <p className="text-gray-500 text-sm mb-2">📍 {space.location.city}, {space.location.country}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            <span className="text-sm font-medium text-gray-700">
              {space.averageRating > 0 ? space.averageRating.toFixed(1) : "Nouveau"}
            </span>
            {space.reviews?.length > 0 && (
              <span className="text-gray-400 text-xs">({space.reviews.length})</span>
            )}
          </div>
          <div>
            <span className="font-bold text-indigo-600 text-lg">{space.price.toLocaleString()}</span>
            <span className="text-gray-400 text-sm"> MAD/jour</span>
          </div>
        </div>
        <p className="text-gray-400 text-xs mt-2">👥 Capacité: {space.capacity} personnes</p>
      </div>
    </Link>
  );
}
