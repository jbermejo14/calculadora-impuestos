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
        <span className="text-base leading-none">🛡️</span>
        <div>
          <p>
            <strong>{estadoTexto}</strong> Fuente:{' '}
            <a href={fuente} target="_blank" rel="noopener noreferrer" title={`Ver norma: ${norma}`}>
              {norma}
            </a>.
          </p>
          <p className="verification-legal">
            <strong>Aviso legal:</strong> La liquidación definitiva la realiza la administración tributaria de la comunidad autónoma correspondiente o la AEAT.
          </p>
        </div>
      </div>
    </div>
  );
}
