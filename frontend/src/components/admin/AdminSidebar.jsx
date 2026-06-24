import { ShieldCheck, LogOut } from "lucide-react";

export default function AdminSidebar({ items, active, onChange, onLogout }) {
  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-100 min-h-screen flex flex-col sticky top-0 self-start">
      <div className="px-5 py-5 border-b border-gray-100">
        <h1 className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <ShieldCheck className="w-5 h-5 text-teal-600" /> Admin
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">EventSpace — Panneau de contrôle</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              active === item.id
                ? "bg-teal-600 text-white"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <item.Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {!!item.badge && (
              <span className="bg-rose-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100 space-y-1">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-rose-600 hover:bg-rose-50 transition"
        >
          <LogOut className="w-4 h-4" /> Déconnexion
        </button>
      </div>
    </aside>
  );
}
