'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MODEL_DETAIL_SECTIONS } from '@/types/models';

export interface NavSection {
  id: string;
  label: string;
}

export function StickySectionNav({
  sections = MODEL_DETAIL_SECTIONS as unknown as NavSection[],
  enableKeyboardShortcuts = true,
}: {
  sections?: NavSection[];
  enableKeyboardShortcuts?: boolean;
}) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? '');
  const navRef = useRef<HTMLDivElement>(null);
  const [topOffset, setTopOffset] = useState(0);

  // Measure the site's global header height so this nav sticks right below it,
  // without needing to know its exact markup or handle its dynamic ticker.
  useEffect(() => {
    const measure = () => {
      const siteNav = document.querySelector('nav');
      if (siteNav) {
        setTopOffset(siteNav.getBoundingClientRect().height || 0);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    const siteNav = document.querySelector('nav');
    let observer: ResizeObserver | undefined;
    if (siteNav && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measure);
      observer.observe(siteNav);
    }
    return () => {
      window.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) {
          const top = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
          setActive(top.target.id);
        }
      },
      { rootMargin: `-${topOffset + 48}px 0px -65% 0px`, threshold: 0 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections, topOffset]);

  const scrollToSection = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY - topOffset - 16;
      window.scrollTo({ top: y, behavior: 'smooth' });
      window.history.replaceState(null, '', `${window.location.pathname}?section=${id}#${id}`);
      setActive(id);
    },
    [topOffset]
  );

  useEffect(() => {
    if (!enableKeyboardShortcuts) return;
    let awaitingLetter = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // Digit 1-9 jump to section index
      if (/^[1-9]$/.test(e.key)) {
        const idx = Number(e.key) - 1;
        if (sections[idx]) {
          e.preventDefault();
          scrollToSection(sections[idx].id);
        }
        return;
      }

      // Single-key jumps
      if (!awaitingLetter) {
        if (e.key.toLowerCase() === 'c') {
          const compare = sections.find((s) => s.id === 'comparison');
          if (compare) {
            e.preventDefault();
            scrollToSection('comparison');
            return;
          }
        }
        if (e.key.toLowerCase() === 'p') {
          const playground = sections.find((s) => s.id === 'playground');
          if (playground) {
            e.preventDefault();
            scrollToSection('playground');
            return;
          }
        }
      }

      if (!awaitingLetter && e.key.toLowerCase() === 'g') {
        awaitingLetter = true;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          awaitingLetter = false;
        }, 1200);
        return;
      }
      if (awaitingLetter) {
        awaitingLetter = false;
        clearTimeout(timeout);
        const letter = e.key.toLowerCase();
        const match = sections.find((s) => s.id.toLowerCase().startsWith(letter) || s.label.toLowerCase().startsWith(letter));
        if (match) scrollToSection(match.id);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      clearTimeout(timeout);
    };
  }, [sections, scrollToSection, enableKeyboardShortcuts]);

  return (
    <div
      ref={navRef}
      className="sticky z-30 border-b border-[var(--m-border)] bg-[var(--m-surface)]/95 backdrop-blur-sm"
      style={{ top: topOffset }}
    >
      <div
        className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8"
        role="navigation"
        aria-label="Model detail sections"
      >
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => scrollToSection(s.id)}
            aria-current={active === s.id ? 'true' : undefined}
            className={`flex-shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              active === s.id
                ? 'bg-[var(--m-brand-soft)] text-[var(--m-brand)]'
                : 'text-[var(--m-text-muted)] hover:bg-[var(--m-surface-2)] hover:text-[var(--m-text)]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default StickySectionNav;
