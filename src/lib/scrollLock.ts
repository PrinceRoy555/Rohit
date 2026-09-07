import { useEffect, useRef } from 'react';

/**
 * Global scroll lock manager to prevent multiple components (mobile menu, modals, chatbot)
 * from conflicting over document.body scroll state.
 */
class ScrollLockManager {
  private activeLocks = new Set<string>();
  private isLocked = false;

  public lock(id: string) {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    if (this.activeLocks.size === 0 && !this.isLocked) {
      this.isLocked = true;

      // Lock scroll while preserving layout width & preventing jump
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'contain';
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

      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
      document.body.style.paddingRight = '';
    }
  }

  public clearAll() {
    this.activeLocks.clear();
    if (typeof document !== 'undefined') {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
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
