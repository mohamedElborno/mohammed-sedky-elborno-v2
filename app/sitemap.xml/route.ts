import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

export async function GET() {
  const baseUrl = "https://mohammed-sedky-elborno.vercel.app";
  const lastmod = new Date().toISOString().split("T")[0];
  const pages = ["", "/biography", "/books", "/media"];

  const urls = routing.locales.flatMap((locale) =>
    pages.map(
      (page) => `
  <url>
    <loc>${baseUrl}/${locale}${page}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
    ),
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("")}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
