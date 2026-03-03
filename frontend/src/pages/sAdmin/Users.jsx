import { useEffect, useState } from "react";

// Edit icon (pencil)
const EditIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

// Trash icon
const TrashIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
);

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchUsers = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/sadmin/users", {
                headers: { Accept: "application/json" },
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to load users.");
            const data = await res.json();
            const list = Array.isArray(data)
                ? data
                : Array.isArray(data?.data)
                    ? data.data
                    : [];
            setUsers(list);
        } catch (err) {
            setError(err.message || "Unable to load users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch(`/sadmin/users/${id}`, {
                method: "DELETE",
                headers: { Accept: "application/json" },
                credentials: "include",
            });
            if (!res.ok) throw new Error("Delete failed.");
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (err) {
            alert(err.message || "Unable to delete user.");
        }
    };

    const padId = (id) => String(id).padStart(3, "0");

    return (
        <div className="p-6">
            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">User List</h1>
                <button
                    className="px-5 py-2 rounded-lg text-white text-sm font-semibold shadow transition-colors"
                    style={{ backgroundColor: "#134C62" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0e3a4d")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#134C62")}
                    onClick={() => alert("Add User — connect to your modal/form here.")}
                >
                    Add User
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-[#EAF4F8] text-gray-700 text-left">
                            <th className="px-6 py-4 font-semibold w-24">ID</th>
                            <th className="px-6 py-4 font-semibold">Full Name</th>
                            <th className="px-6 py-4 font-semibold">Email</th>
                            <th className="px-6 py-4 font-semibold">User Name</th>
                            <th className="px-6 py-4 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                    Loading users...
                                </td>
                            </tr>
                        )}

                        {!loading && error && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-red-500">
                                    {error}
                                </td>
                            </tr>
                        )}

                        {!loading && !error && users.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                    No users found.
                                </td>
                            </tr>
                        )}

                        {!loading &&
                            !error &&
                            users.map((user) => {
                                const fullName =
                                    [user.first_name, user.middle_name, user.last_name]
                                        .filter(Boolean)
                                        .join(" ") ||
                                    user.name ||
                                    "—";

                                return (
                                    <tr
                                        key={user.id}
                                        className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 text-red-500 font-semibold">
                                            {padId(user.id)}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-800">
                                            {fullName}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4 text-gray-600">{user.username}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    title="Edit"
                                                    className="text-[#134C62] hover:text-[#0e3a4d] transition-colors"
                                                    onClick={() =>
                                                        alert(`Edit user ${user.id} — wire up your edit modal here.`)
                                                    }
                                                >
                                                    <EditIcon />
                                                </button>
                                                <button
                                                    title="Delete"
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                    onClick={() => handleDelete(user.id)}
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
