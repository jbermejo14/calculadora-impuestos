import React from 'react';

export interface VerificationNoticeProps {
  anio: number;
  fechaVerificacion: string;
  fuente: string;
  norma: string;
  className?: string;
}

export function VerificationNotice({
  anio,
  fechaVerificacion,
  fuente,
  norma,
  className = ''
}: VerificationNoticeProps) {
  // Formatear fecha legible en español si viene en YYYY-MM-DD
  const fechaFormateada = (() => {
    try {
      const [y, m, d] = fechaVerificacion.split('-');
      if (y && m && d) {
        return `${d}/${m}/${y}`;
      }
    } catch {
      // fallback
    }
    return fechaVerificacion;
  })();

  return (
    <div className={`verification-box ${className}`}>
      <div className="flex items-start gap-2">
        <span className="text-base leading-none">🛡️</span>
        <div>
          <p>
            Cálculo orientativo con datos fiscales de <strong>{anio}</strong>, verificados el{' '}
            <strong>{fechaFormateada}</strong> conforme a{' '}
            <a href={fuente} target="_blank" rel="noopener noreferrer" title={`Ver norma oficial: ${norma}`}>
              {norma}
            </a>.
          </p>
          <p className="verification-legal">
            <strong>Aviso legal:</strong> La liquidación oficial definitiva la realiza la administración tributaria de la comunidad autónoma correspondiente o la AEAT.
          </p>
        </div>
      </div>
    </div>
  );
}
