import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import api from "../utils/api";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState([]);

  useEffect(() => {
    api.get("/notifications").then((res) => {
      setList(res.data || []);
    });
  }, []);

  const unreadCount = list.filter((n) => !n.read).length;

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setList((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="relative">
      {/* Bell */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative p-2 rounded-full hover:bg-white/10"
      >
        <Bell className="text-white" size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white w-5 h-5 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-black border border-white/10 rounded-xl shadow-lg z-50">
          {list.length === 0 ? (
            <div className="p-4 text-white/60 text-sm">
              No notifications
            </div>
          ) : (
            list.map((n) => (
              <div
                key={n._id}
                onClick={() => markRead(n._id)}
                className={`px-4 py-3 text-sm cursor-pointer border-b border-white/5
                ${n.read ? "text-white/50" : "text-white"}`}
              >
                {n.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
