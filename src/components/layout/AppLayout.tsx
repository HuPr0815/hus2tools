import { useState, useEffect, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import SearchDialog from './SearchDialog';
import { useRecentTools } from '@/hooks/useRecentTools';
import { cn } from '@/lib/utils';

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const { addRecent } = useRecentTools();

  useEffect(() => {
    const toolId = location.pathname.slice(1);
    if (toolId) addRecent(toolId);
  }, [location.pathname, addRecent]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-background text-on-surface overflow-hidden">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 transition-transform duration-300',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0 md:static md:z-auto'
        )}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          onNavigate={() => setMobileMenuOpen(false)}
        />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <Header
          onSearchClick={() => setSearchOpen(true)}
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-auto bg-background">
          <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}>
            <div key={location.key} className="animate-page-enter">
              <Outlet />
            </div>
          </Suspense>
        </main>
        <footer className="shrink-0 py-3 text-center bg-surface/60 backdrop-blur-sm border-t border-outline-variant/10">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-on-surface-variant/50 hover:text-primary transition-colors spring-transition"
          >
            闽ICP备2022011948号-1
          </a>
        </footer>
      </div>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
