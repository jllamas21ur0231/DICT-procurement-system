import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './Sidebar';
import Profile from '../pages/Profile';
import Notification from '../pages/Notification';
import { SearchProvider, useSearch } from '../context/SearchContext';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// ── Icons ───────────────────────────────────────────────────────────────────
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="black" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const FILTER_OPTIONS = ["All", "Procurement", "PPMP", "Purchase Request"];

// ── Inner layout — consumes the context provided by the wrapper below ────────
function MainLayoutInner({ children }) {
  const { search, setSearch, filter, setFilter } = useSearch();
  const [notifCount, setNotifCount] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const intervalRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/notifications/unread-count', {
        credentials: 'include',
        headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifCount(data.unread_count ?? 0);
      }
    } catch {
      // silently ignore — badge simply won't update if offline
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    intervalRef.current = setInterval(fetchUnreadCount, 30_000);
    return () => clearInterval(intervalRef.current);
  }, [fetchUnreadCount]);

  const handleCloseNotif = useCallback(() => {
    setShowNotif(false);
    fetchUnreadCount(); // refresh badge after panel closes
  }, [fetchUnreadCount]);

  return (
    <>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />

        <div className="flex flex-col flex-1 min-w-0">
          <header className="h-16 bg-transparent flex items-center justify-end px-8 gap-5 flex-shrink-0">

            {/* Search bar */}
            <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden h-9">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost"
                    className="flex items-center gap-1.5 h-full px-3 rounded-none text-sm text-gray-500 hover:bg-gray-200 font-normal">
                    {filter}
                    <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44">
                  <DropdownMenuLabel className="text-xs text-gray-400">Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {FILTER_OPTIONS.map((opt) => (
                    <DropdownMenuItem key={opt}
                      onClick={() => { setFilter(opt); setSearch(''); }}
                      className={cn("cursor-pointer text-sm", filter === opt && "font-semibold text-[#134C62]")}>
                      {opt}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white text-sm text-gray-600 outline-none border-none placeholder:text-gray-400 px-3 w-44 h-full"
              />

              <Button variant="ghost" size="icon"
                className="h-full w-9 rounded-none text-gray-400 hover:text-[#134C62] hover:bg-gray-200">
                <SearchIcon />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <Button
              variant="ghost" size="icon"
              onClick={() => setShowNotif(!showNotif)}
              className="relative rounded-full text-gray-500 hover:text-[#134C62] hover:bg-gray-100 w-9 h-9"
            >
              <BellIcon />
              {notifCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 p-0 flex items-center justify-center bg-red-500 text-[10px] rounded-full border-0">
                  {notifCount > 99 ? '99+' : notifCount}
                </Badge>
              )}
            </Button>

            <Button
              variant="ghost" size="icon"
              onClick={() => setShowProfile(true)}
              className="rounded-full text-gray-500 hover:text-[#134C62] hover:bg-gray-100 w-9 h-9"
            >
              <UserIcon />
            </Button>
          </header>

          <main className="flex-1 p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      <Profile isOpen={showProfile} onClose={() => setShowProfile(false)} />
      <Notification isOpen={showNotif} onClose={handleCloseNotif} onCountChange={setNotifCount} />
    </>
  );
}

// ── Default export — provides the context, then renders the inner layout ────
export default function MainLayout({ children }) {
  return (
    <SearchProvider>
      <MainLayoutInner>{children}</MainLayoutInner>
    </SearchProvider>
  );
}
