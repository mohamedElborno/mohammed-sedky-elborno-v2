import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "تراث الشيخ محمد صدقي البورنو",
    short_name: "تراث الشيخ",
    description:
      "أرشيف رقمي لتراث الشيخ محمد صدقي البورنو: سيرته وكتبه ومقاطعه.",
    lang: "ar",
    dir: "rtl",
    start_url: "/ar",
    display: "standalone",
    background_color: "#171717",
    theme_color: "#171717",
    icons: [{ src: "/logo.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
