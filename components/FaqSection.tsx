export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  title: string;
  items: FaqItem[];
}

/** Datos estructurados schema.org FAQPage de una lista de preguntas. */
export function buildFaqJsonLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
}

/** Bloque de preguntas frecuentes visible (details/summary) con su JSON-LD FAQPage. No pinta nada si no hay preguntas. */
export function FaqSection({ title, items }: FaqSectionProps) {
  if (items.length === 0) return null;

  return (
    <div className="card mb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(items)) }}
      />
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      <div className="space-y-3">
        {items.map(item => (
          <details key={item.question} className="p-4 rounded-lg bg-elevated border border-line">
            <summary className="font-semibold text-sm text-fg cursor-pointer">{item.question}</summary>
            <p className="text-sm text-muted leading-relaxed mt-2">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
