import { useEffect, useRef } from 'react';

/**
 * Global scroll lock manager to prevent multiple components (mobile menu, modals, chatbot)
 * from conflicting over document.body scroll state.
 */
class ScrollLockManager {
  private activeLocks = new Set<string>();
  private savedScrollY = 0;
  private isLocked = false;

  public lock(id: string) {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    if (this.activeLocks.size === 0 && !this.isLocked) {
      this.savedScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      this.isLocked = true;

      // Lock body while preserving layout width & position
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${this.savedScrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
    }

    this.activeLocks.add(id);
  }

  public unlock(id: string) {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    this.activeLocks.delete(id);

    if (this.activeLocks.size === 0 && this.isLocked) {
      this.isLocked = false;
      const scrollY = this.savedScrollY;

      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      // Instantly restore the exact prior scroll offset without triggering smooth scroll animation
      const prevBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      try {
        window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' as ScrollBehavior });
      } catch {
        window.scrollTo(0, scrollY);
      }
      // Revert inline style on next microtask so normal smooth scroll remains intact
      requestAnimationFrame(() => {
        document.documentElement.style.scrollBehavior = prevBehavior;
      });
    }
  }

  public clearAll() {
    this.activeLocks.clear();
    if (typeof document !== 'undefined') {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    this.isLocked = false;
  }
}

export const scrollLockManager = new ScrollLockManager();

export function useBodyScrollLock(isLocked: boolean, lockId?: string) {
  const idRef = useRef<string>(lockId || `lock-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    const id = idRef.current;
    if (isLocked) {
      scrollLockManager.lock(id);
    } else {
      scrollLockManager.unlock(id);
    }

    return () => {
      scrollLockManager.unlock(id);
    };
  }, [isLocked]);
}
