'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export function Header() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Leer preferencia guardada o tema actual del html
    const saved = localStorage.getItem('autotax_theme') as 'dark' | 'light' | null;
    const current = (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || saved || 'dark';
    setTheme(current);
    document.documentElement.setAttribute('data-theme', current);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('autotax_theme', nextTheme);
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <Link href="/" className="brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11.2 2 11.7 2 12.2V16c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" />
              <path d="M9 17h6" />
              <circle cx="17" cy="17" r="2" />
            </svg>
          </div>
          <div>
            <span className="brand-title">
              Auto<span>Tax</span>
            </span>
            <p className="brand-subtitle">Impuestos de Matriculación &amp; Transferencia DGT</p>
          </div>
        </Link>

        <div className="header-actions">
          {/* Botón Modo Oscuro / Modo Claro */}
          <button
            id="themeToggleBtn"
            className="theme-toggle-btn"
            type="button"
            onClick={toggleTheme}
            aria-label="Cambiar tema de color"
            title="Alternar Modo Oscuro / Modo Claro"
          >
            {theme === 'dark' ? (
              <>
                <span className="text-amber-400 inline-flex items-center">
                  {/* Sun icon */}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                </span>
                <span>Modo Claro</span>
              </>
            ) : (
              <>
                <span className="text-slate-600 inline-flex items-center">
                  {/* Moon icon */}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                </span>
                <span>Modo Oscuro</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
