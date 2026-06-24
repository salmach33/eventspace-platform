import { Search } from "lucide-react";

// Barre générique : champ de recherche + selects de filtres, réutilisée par toutes les sections admin
export default function AdminFilterBar({ search, onSearchChange, searchPlaceholder = "Rechercher...", filters = [], resultsCount }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-5">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
        />
      </div>
      {filters.map((f) => (
        <select
          key={f.label}
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
        >
          <option value="all">{f.label}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ))}
      {typeof resultsCount === "number" && (
        <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
          {resultsCount} résultat{resultsCount !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
