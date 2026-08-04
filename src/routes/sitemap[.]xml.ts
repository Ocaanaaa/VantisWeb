import { createFileRoute } from '@tanstack/react-router'
import { copy } from '../content'

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin
        const today = new Date().toISOString().split('T')[0]
        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          '  <url>',
          `    <loc>${origin}/</loc>`,
          `    <lastmod>${today}</lastmod>`,
          '    <changefreq>weekly</changefreq>',
          '    <priority>1.0</priority>',
          '  </url>',
          // Cada unidad tiene su propia ficha indexable.
          ...copy.available.items.flatMap((unit) => [
            '  <url>',
            `    <loc>${origin}/unidades/${unit.slug}</loc>`,
            `    <lastmod>${today}</lastmod>`,
            '    <changefreq>daily</changefreq>',
            '    <priority>0.8</priority>',
            '  </url>',
          ]),
          '</urlset>',
        ].join('\n')
        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
