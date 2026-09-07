import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PanelLeft } from 'lucide-react';

interface SidebarContextType {
  open: boolean;
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean | ((prev: boolean) => boolean)) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
  state: 'expanded' | 'collapsed';
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const SIDEBAR_STORAGE_KEY = 'shadcn_admin_sidebar_state';

interface SidebarProviderProps {
  children: ReactNode;
  defaultOpen?: boolean;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
  defaultOpen = true,
}) => {
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return defaultOpen;
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (stored === 'collapsed') return false;
      if (stored === 'expanded') return true;
    } catch {
      // ignore
    }
    return defaultOpen;
  });

  const [openMobile, setOpenMobile] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Monitor responsive viewport (mobile < 1024px)
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setOpenMobile(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Save state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, open ? 'expanded' : 'collapsed');
    } catch {
      // ignore
    }
  }, [open]);

  // Keyboard shortcut: Cmd+B or Ctrl+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setOpenMobile((prev) => !prev);
    } else {
      setOpen((prev) => !prev);
    }
  };

  const state = open ? 'expanded' : 'collapsed';

  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
        toggleSidebar,
        state,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarTrigger: React.FC<{
  className?: string;
  title?: string;
}> = ({ className = '', title = 'Toggle Sidebar (⌘B)' }) => {
  const { toggleSidebar, state, isMobile } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      title={title}
      aria-label="Toggle Sidebar"
      className={`h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border-color bg-bg-secondary/60 hover:bg-bg-card-hover text-text-muted hover:text-text-primary transition-colors cursor-pointer active:scale-95 ${className}`}
    >
      <PanelLeft className="w-4 h-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  );
};

export const SidebarInset: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div
      className={`flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-bg-primary transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
};
