import { useState, useEffect } from "react";
import API from "../services/api";

const MONTHS_FR = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const DAYS_FR = ["L", "M", "M", "J", "V", "S", "D"];

export default function AvailabilityCalendar({ spaceId, selectedDate, onSelectDate }) {
  const [bookedDates, setBookedDates] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!spaceId) return;
    API.get(`/reservations/space/${spaceId}/booked-dates`)
      .then(({ data }) => setBookedDates(data))
      .catch(() => setBookedDates([]))
      .finally(() => setLoading(false));
  }, [spaceId]);

  const getDateStatus = (date) => {
    const dStr = date.toDateString();
    const found = bookedDates.find((b) => new Date(b.date).toDateString() === dStr);
    return found?.status || null; // "accepted" | "pending" | null
  };

  const isPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Génère les jours du mois affiché
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Lundi = 0

  const days = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));

  const changeMonth = (delta) => {
    setCurrentMonth(new Date(year, month + delta, 1));
  };

  const canGoBack = () => {
    const today = new Date();
    return year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth());
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Header navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          disabled={!canGoBack()}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-gray-700">
          {MONTHS_FR[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
        >
          ›
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-1" style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>
            {DAYS_FR.map((d, i) => (
              <div key={i} className="text-center text-xs text-gray-400 font-medium py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1" style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>
            {days.map((date, i) => {
              if (!date) return <div key={i} />;

              const status = getDateStatus(date);
              const past = isPast(date);
              const isSelected = selectedDate && new Date(selectedDate).toDateString() === date.toDateString();
              const disabled = past || status === "accepted";

              let classes = "w-full aspect-square flex items-center justify-center text-xs rounded-lg transition cursor-pointer ";

              if (past) {
                classes += "text-gray-300 cursor-not-allowed";
              } else if (status === "accepted") {
                classes += "bg-red-100 text-red-400 cursor-not-allowed line-through";
              } else if (status === "pending") {
                classes += "bg-yellow-50 text-yellow-600 hover:bg-yellow-100";
              } else if (isSelected) {
                classes += "bg-teal-600 text-white font-bold";
              } else {
                classes += "text-gray-700 hover:bg-teal-50";
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectDate && onSelectDate(date)}
                  className={classes}
                  style={{ minWidth: 0 }}
                  title={
                    status === "accepted"
                      ? "Déjà réservé"
                      : status === "pending"
                      ? "Demande en attente"
                      : ""
                  }
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-100 border border-red-200" />
              Réservé
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-yellow-50 border border-yellow-200" />
              En attente
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-teal-600" />
              Sélectionné
            </div>
          </div>
        </>
      )}
    </div>
  );
}
