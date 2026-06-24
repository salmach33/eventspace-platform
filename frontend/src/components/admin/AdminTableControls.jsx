import { useEffect, useMemo, useState } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

// Tri + pagination génériques pour les tableaux admin.
// `sorters` est un objet { columnKey: (item) => valeur comparable }.
export function useAdminTable(data, { sorters = {}, defaultSort = null, defaultDir = "asc", pageSize = 8 } = {}) {
  const [sortKey, setSortKey] = useState(defaultSort);
  const [sortDir, setSortDir] = useState(defaultDir);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [data]);

  const sorted = useMemo(() => {
    const getValue = sortKey && sorters[sortKey];
    if (!getValue) return data;
    const arr = [...data];
    arr.sort((a, b) => {
      const av = getValue(a);
      const bv = getValue(b);
      let cmp;
      if (typeof av === "string" || typeof bv === "string") {
        cmp = String(av ?? "").localeCompare(String(bv ?? ""));
      } else {
        cmp = (av ?? 0) - (bv ?? 0);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [data, sortKey, sortDir, sorters]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => sorted.slice((safePage - 1) * pageSize, safePage * pageSize),
    [sorted, safePage, pageSize]
  );

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return {
    pageItems,
    sortKey,
    sortDir,
    toggleSort,
    page: safePage,
    setPage,
    totalPages,
    total: sorted.length,
  };
}

export function SortableTh({ label, sortKey, currentKey, dir, onSort, className = "" }) {
  if (!sortKey) {
    return <th className={`px-4 py-3 ${className}`}>{label}</th>;
  }
  const active = currentKey === sortKey;
  return (
    <th className={`px-4 py-3 ${className}`}>
      <button
        onClick={() => onSort(sortKey)}
        className="flex items-center gap-1 hover:text-gray-900 transition"
      >
        {label}
        {active ? (
          dir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-30" />
        )}
      </button>
    </th>
  );
}

export function AdminPagination({ page, totalPages, onPageChange, total, pageSize }) {
  if (totalPages <= 1) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
      <span>{start}–{end} sur {total}</span>
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-1">{page} / {totalPages}</span>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
