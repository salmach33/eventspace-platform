import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function AdminSidebar({ items, active, onChange, onBack }) {
  return (
    <aside className="w-64 flex-shrink-0 bg-gray-900 border-r border-gray-800 min-h-screen flex flex-col sticky top-0 self-start">
      <div className="px-5 py-5 border-b border-gray-800">
        <h1 className="flex items-center gap-2 text-lg font-bold text-white">
          <ShieldCheck className="w-5 h-5 text-teal-400" /> Admin
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">EventSpace — Panneau de contrôle</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              active === item.id
                ? "bg-teal-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <item.Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {!!item.badge && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-800">
        <button
          onClick={onBack}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au site
        </button>
      </div>
    </aside>
  );
}
