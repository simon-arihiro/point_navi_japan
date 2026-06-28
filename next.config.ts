import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // 旧WordPressサイト時代に存在していたURL（Google検索結果にまだ残存）を新しいページへ301リダイレクトする
  async redirects() {
    // カテゴリ名が日本語のみの場合にslug自動生成が空文字になり cat-<timestamp> 形式の読めないURLで
    // 生成・収録されてしまっていた旧カテゴリスラッグから、意味のある新スラッグへの301リダイレクト
    const categorySlugFixes: [string, string][] = [
      ["cat-1781062241563", "credit-card"],
      ["cat-1781062247479", "survey"],
      ["cat-1781062254098", "monitor"],
      ["cat-1781062261235", "receipt"],
      ["cat-1781062269505", "walking"],
      ["cat-1781062284433", "video"],
      ["cat-1781062289812", "game"],
      ["cat-1781099870816", "healthcare"],
      ["cat-1781565378644", "point-site"],
      ["cat-1781907272840", "finance-investment"],
      ["cat-1781907442508", "emoney-payment"],
    ];
    const categoryRedirects = categorySlugFixes.flatMap(([oldSlug, newSlug]) => [
      { source: `/services/${oldSlug}`, destination: `/services/${newSlug}`, permanent: true },
      { source: `/services/${oldSlug}/:slug*`, destination: `/services/${newSlug}/:slug*`, permanent: true },
      { source: `/articles/${oldSlug}`, destination: `/articles/${newSlug}`, permanent: true },
      { source: `/articles/${oldSlug}/:slug*`, destination: `/articles/${newSlug}/:slug*`, permanent: true },
    ]);
    return [
      { source: "/hello-world", destination: "/", permanent: true },
      { source: "/category/:slug*", destination: "/articles", permanent: true },
      ...categoryRedirects,
    ];
  },
};

export default nextConfig;
