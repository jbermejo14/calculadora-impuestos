'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CalculadoraMatriculacion } from './CalculadoraMatriculacion';
import { CalculadoraTransferencia } from './CalculadoraTransferencia';
import { CommunityLinks } from './CommunityLinks';
import { GuidePanel } from './GuidePanel';
import { TerritoryLinks } from './TerritoryLinks';
import { ComunidadITPData } from '@/lib/itp';

export interface HomeTabsProps {
  comunidades: ComunidadITPData[];
}

type TabId = 'matriculacion' | 'transferencia' | 'guia';

interface TabDefinition {
  id: TabId;
  shortLabel: string;
  longLabel: string;
  icon: React.ReactNode;
}

const ICON_SIZE = 18;

const TABS: TabDefinition[] = [
  {
    id: 'matriculacion',
    shortLabel: 'Matriculación',
    longLabel: 'Matriculación (nuevo o importado)',
    icon: (
      <svg viewBox="0 0 24 24" width={ICON_SIZE} height={ICON_SIZE} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="2" y="7" width="20" height="11" rx="2"></rect>
        <path d="M7 11h2v3H7zM11 11h2v3h-2zM15 11h2v3h-2z"></path>
      </svg>
    )
  },
  {
    id: 'transferencia',
    shortLabel: 'Transferencia',
    longLabel: 'Transferencia / compraventa (ITP)',
    icon: (
      <svg viewBox="0 0 24 24" width={ICON_SIZE} height={ICON_SIZE} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M16 3h5v5"></path>
        <path d="M4 20L21 3"></path>
        <path d="M21 16v5h-5"></path>
        <path d="M15 15l6 6"></path>
        <path d="M4 4l5 5"></path>
      </svg>
    )
  },
  {
    id: 'guia',
    shortLabel: 'Tramos',
    longLabel: 'Guía de tramos y exenciones',
    icon: (
      <svg viewBox="0 0 24 24" width={ICON_SIZE} height={ICON_SIZE} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    )
  }
];

const ARROW_RIGHT = 'ArrowRight';
const ARROW_LEFT = 'ArrowLeft';

/** Pestaña indicada en el hash de la URL (/#transferencia), si es una de las conocidas. */
function tabFromHash(hash: string): TabId | null {
  const candidate = hash.replace('#', '');
  return TABS.some(tab => tab.id === candidate) ? (candidate as TabId) : null;
}

function tabButtonId(id: TabId): string {
  return `tab-${id}`;
}

function tabPanelId(id: TabId): string {
  return `panel-${id}`;
}

/**
 * Índice de la pestaña a la que lleva la tecla pulsada, de forma circular.
 * Devuelve null si la tecla no es una flecha izquierda o derecha.
 */
export function nextTabIndex(index: number, key: string, length: number): number | null {
  if (key !== ARROW_RIGHT && key !== ARROW_LEFT) return null;
  const step = key === ARROW_RIGHT ? 1 : -1;
  return (index + step + length) % length;
}

export function HomeTabs({ comunidades }: HomeTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('matriculacion');
  const buttonRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});

  // Las migas de pan y los botones de las guías enlazan a /#matriculacion, /#transferencia y /#guia.
  useEffect(() => {
    const syncWithHash = () => {
      const fromHash = tabFromHash(window.location.hash);
      if (fromHash) setActiveTab(fromHash);
    };
    syncWithHash();
    window.addEventListener('hashchange', syncWithHash);
    return () => window.removeEventListener('hashchange', syncWithHash);
  }, []);

  /** Mueve el foco y la selección con las flechas, de forma circular. */
  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    const nextIndex = nextTabIndex(index, event.key, TABS.length);
    if (nextIndex === null) return;
    event.preventDefault();
    const next = TABS[nextIndex];
    setActiveTab(next.id);
    buttonRefs.current[next.id]?.focus();
  };

  return (
    <div>
      {/* Selector de calculadora: control segmentado de 3 columnas */}
      <div className="tabs-nav grid grid-cols-3" role="tablist" aria-label="Calculadoras">
        {TABS.map((tab, index) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={element => {
                buttonRefs.current[tab.id] = element;
              }}
              id={tabButtonId(tab.id)}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={tabPanelId(tab.id)}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={event => handleKeyDown(event, index)}
            >
              {tab.icon}
              <span className="tab-label-short">{tab.shortLabel}</span>
              <span className="tab-label-long">{tab.longLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Panel 1: Matriculación */}
      <section
        id={tabPanelId('matriculacion')}
        role="tabpanel"
        aria-labelledby={tabButtonId('matriculacion')}
        hidden={activeTab !== 'matriculacion'}
      >
        <div className="mb-4">
          <TerritoryLinks />
        </div>
        <CalculadoraMatriculacion />
      </section>

      {/* Panel 2: Transferencia */}
      <section
        id={tabPanelId('transferencia')}
        role="tabpanel"
        aria-labelledby={tabButtonId('transferencia')}
        hidden={activeTab !== 'transferencia'}
      >
        <CommunityLinks comunidades={comunidades} />
        <CalculadoraTransferencia />
      </section>

      {/* Panel 3: Guía */}
      <section
        id={tabPanelId('guia')}
        role="tabpanel"
        aria-labelledby={tabButtonId('guia')}
        hidden={activeTab !== 'guia'}
      >
        <GuidePanel />
      </section>
    </div>
  );
}
