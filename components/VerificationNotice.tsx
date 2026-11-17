import React from 'react';
import { textoVerificacion, type VerificacionDato } from '@/lib/verification';

export interface VerificationNoticeProps extends VerificacionDato {
  anio: number;
  fuente: string;
  norma: string;
  className?: string;
}

export function VerificationNotice({
  anio,
  estadoVerificacion,
  fechaVerificacion,
  fuente,
  norma,
  className = ''
}: VerificationNoticeProps) {
  const estadoTexto = textoVerificacion({ estadoVerificacion, fechaVerificacion }, anio);

  return (
    <div className={`verification-box ${className}`}>
      <div className="flex items-start gap-2">
        <svg
          className="verification-icon"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
        <div>
          <p>
            <strong>{estadoTexto}</strong> Fuente:{' '}
            <a href={fuente} target="_blank" rel="noopener noreferrer" title={`Ver norma: ${norma}`}>
              {norma}
            </a>.
          </p>
          <p className="verification-legal">
            <strong>Aviso legal:</strong> La liquidación definitiva la realiza la administración tributaria de la comunidad autónoma correspondiente o la AEAT. Este resultado es orientativo y no sustituye a la liquidación oficial. Esta web es independiente: no es un sitio oficial de la DGT ni de Hacienda.
          </p>
        </div>
      </div>
    </div>
  );
}
