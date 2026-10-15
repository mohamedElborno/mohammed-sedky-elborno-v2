import localFont from "next/font/local";

// Used for every language. Keep the font files inside the app (not public/):
// the thmanyah license only allows them to ship as part of the compiled site.
export const thmanyah = localFont({
  src: [
    { path: "./thmanyah/thmanyahsans-Light.woff2", weight: "300", style: "normal" },
    { path: "./thmanyah/thmanyahsans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./thmanyah/thmanyahsans-Medium.woff2", weight: "500", style: "normal" },
    { path: "./thmanyah/thmanyahsans-Bold.woff2", weight: "700", style: "normal" },
    { path: "./thmanyah/thmanyahsans-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-thmanyah",
  display: "swap",
});
