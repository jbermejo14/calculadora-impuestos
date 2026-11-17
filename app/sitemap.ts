import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';
import { getComunidadesList } from '@/lib/itp';
import { getIEDMTData } from '@/lib/iedmt';
import guias2026 from '@/data/2026/guias.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // 1. Home
  const routes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0
    }
  ];

  // 2. ITP por comunidad autónoma (19 páginas)
  const comunidades = getComunidadesList(2026);
  for (const com of comunidades) {
    routes.push({
      url: absoluteUrl(`/itp-coche-segunda-mano/${com.slug}`),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9
    });
  }

  // 3. Impuesto de matriculación por territorio (3 páginas)
  const iedmtData = getIEDMTData(2026);
  for (const slug of Object.keys(iedmtData.territorios)) {
    routes.push({
      url: absoluteUrl(`/impuesto-matriculacion/${slug}`),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8
    });
  }

  // 4. Guías (4 páginas)
  for (const slug of Object.keys(guias2026.temas)) {
    routes.push({
      url: absoluteUrl(`/guia/${slug}`),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7
    });
  }

  return routes;
}
