import React, { useState, useEffect, useCallback } from "react";
import { Tag, X, Bell, CheckCheck, Loader2 } from "lucide-react";

// ─── Helper: get CSRF token from the meta tag Laravel injects ─────────────────
function getCsrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? "";
}

// ─── Helper: fetch wrapper with credentials + CSRF ────────────────────────────
async function api(url, method = "GET") {
  const res = await fetch(url, {
    method,
    credentials: "include",           // send session cookie
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "X-CSRF-TOKEN": getCsrfToken(), // required for PATCH/POST/DELETE
      "X-Requested-With": "XMLHttpRequest",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}

export default function Notification({ isOpen, onClose }) {
  const [showFullModal, setShowFullModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [markingRead, setMarkingRead] = useState(false);

  // ─── Fetch notifications ──────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api("/notifications");
      setNotifications(data.data ?? data);
    } catch (err) {
      setError("Failed to load notifications.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  // ─── Mark single as read ──────────────────────────────────────────────────
  const markAsRead = async (id) => {
    try {
      await api(`/notifications/${id}/read`, "PATCH");
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  // ─── Mark all as read ─────────────────────────────────────────────────────
  const markAllRead = async () => {
    setMarkingRead(true);
    try {
      await api("/notifications/read-all", "PATCH");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
      );
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setMarkingRead(false);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const handleSeeAll = () => setShowFullModal(true);
  const handleCloseAll = () => { setShowFullModal(false); onClose(); };

  const handleNotificationClick = (notification) => {
    if (!notification.read_at) markAsRead(notification.id);
  };

  // ─── Notification row ─────────────────────────────────────────────────────
  const NotificationRow = ({ notification, compact = false }) => {
    const isUnread = !notification.read_at;
    return (
      <div
        onClick={() => handleNotificationClick(notification)}
        className={[
          compact ? "px-5 py-4" : "px-6 py-5",
          "border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer",
          isUnread ? "bg-teal-50/40" : "",
        ].join(" ")}
      >
        <div className={`flex items-start ${compact ? "gap-3" : "gap-4"}`}>
          <div className="flex-shrink-0">
            <div className={[
              compact ? "w-8 h-8" : "w-10 h-10",
              isUnread ? "bg-teal-700" : "bg-gray-300",
              "rounded-lg flex items-center justify-center transition-colors",
            ].join(" ")}>
              <Tag className={`${compact ? "w-4 h-4" : "w-5 h-5"} text-white`} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h3 className={[
                compact ? "text-sm" : "text-base",
                "font-semibold leading-tight",
                isUnread ? "text-teal-900" : "text-gray-600",
              ].join(" ")}>
                {notification.title}
              </h3>
              <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                {formatTime(notification.created_at)}
              </span>
            </div>
            <p className={`${compact ? "text-xs mt-0.5" : "text-sm mt-1"} text-gray-600`}>
              {notification.message}
            </p>
            {isUnread && (
              <span className="inline-block mt-1 w-2 h-2 rounded-full bg-teal-500" />
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  // ─── Full modal ───────────────────────────────────────────────────────────
  if (showFullModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={handleCloseAll}>
        <div className="absolute inset-0 bg-black/50" />
        <div
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
              {unreadCount > 0 && (
                <span className="bg-teal-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={markingRead}
                  className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors disabled:opacity-50"
                >
                  {markingRead ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3 h-3" />}
                  Mark all read
                </button>
              )}
              <button onClick={handleCloseAll} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {loading && <LoadingState />}
            {error && <ErrorState message={error} onRetry={fetchNotifications} />}
            {!loading && !error && notifications.length === 0 && <EmptyState />}
            {!loading && !error && notifications.map((n) => (
              <NotificationRow key={n.id} notification={n} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Dropdown panel ───────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/10" />
      <div
        className="absolute top-20 right-10 w-[320px] bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-teal-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingRead}
              className="text-xs text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50"
            >
              {markingRead ? "Marking..." : "Mark all read"}
            </button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {loading && <LoadingState compact />}
          {error && <ErrorState message={error} onRetry={fetchNotifications} compact />}
          {!loading && !error && notifications.length === 0 && <EmptyState compact />}
          {!loading && !error && notifications.slice(0, 5).map((n) => (
            <NotificationRow key={n.id} notification={n} compact />
          ))}
        </div>

        <div className="px-5 py-3 text-center border-t border-gray-100">
          <button
            onClick={handleSeeAll}
            className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
          >
            See All {notifications.length > 5 ? `(${notifications.length})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Utility components ───────────────────────────────────────────────────────

function LoadingState({ compact = false }) {
  return (
    <div className={`flex items-center justify-center ${compact ? "py-8" : "py-12"}`}>
      <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
    </div>
  );
}

function ErrorState({ message, onRetry, compact = false }) {
  return (
    <div className={`flex flex-col items-center justify-center ${compact ? "py-8" : "py-12"} gap-2`}>
      <p className="text-sm text-red-500">{message}</p>
      <button onClick={onRetry} className="text-xs text-teal-600 hover:underline font-medium">
        Try again
      </button>
    </div>
  );
}

function EmptyState({ compact = false }) {
  return (
    <div className={`flex flex-col items-center justify-center ${compact ? "py-10" : "py-14"} gap-2`}>
      <Bell className="w-8 h-8 text-gray-300" />
      <p className="text-sm text-gray-400 font-medium">No notifications yet</p>
    </div>
  );
}

// ─── Format timestamp ─────────────────────────────────────────────────────────
function formatTime(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}