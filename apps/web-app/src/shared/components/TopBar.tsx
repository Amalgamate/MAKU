import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, X } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { Avatar } from '@maku/ui';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl/Cmd+K shortcut
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
        setSearchValue('');
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue('');
    }
  }

  return (
    <header className="flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 sm:px-5">

      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex-shrink-0 rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className={[
          'flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-all duration-150',
          searchFocused
            ? 'border-brand-600 bg-white shadow-sm ring-2 ring-brand-600/20'
            : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white',
        ].join(' ')}>
          <Search
            size={15}
            className={searchFocused ? 'text-brand-600' : 'text-gray-400'}
          />
          <input
            ref={inputRef}
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search members, records…"
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none min-w-0"
            aria-label="Global search"
          />
          {searchValue ? (
            <button
              type="button"
              onClick={() => setSearchValue('')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          ) : (
            <kbd className="hidden sm:flex items-center gap-0.5 rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-400 font-sans">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          )}
        </div>
      </form>

      {/* Right actions */}
      <div className="flex items-center gap-1 ml-auto">

        {/* Notifications */}
        <button
          className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-1 ring-white" aria-hidden="true" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200 mx-1" aria-hidden="true" />

        {/* Profile */}
        {user && (
          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors"
            aria-label="My profile"
          >
            <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-gray-800 leading-tight">
                {user.fullName.split(' ')[0]}
              </p>
              <p className="text-[10px] text-gray-400 leading-tight capitalize">
                {user.role.replace(/_/g, ' ')}
              </p>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
