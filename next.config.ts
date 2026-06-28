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

    // AI生成記事のslugが `${service}-${type}-${timestamp}` 形式で収録されていたものを
    // 意味のある `${service}-${type}` 形式へ301リダイレクトする（記事側は2階層目がslugのためカテゴリ階層をワイルドカードで吸収する）
    const articleSlugFixes: [string, string][] = [
      ["cashwalk-guide-1781185595130", "cashwalk-guide"],
      ["cashwalk-faq-1781444680923", "cashwalk-faq"],
      ["freecash-guide-1781998598897", "freecash-guide"],
      ["moneywalk-guide-1781100277749", "moneywalk-guide"],
      ["pointincome-guide-1781905874470", "pointincome-guide"],
      ["townwifi-guide-1781519509366", "townwifi-guide"],
      ["torima-guide-1781703282372", "torima-guide"],
      ["poitama-guide-1781564185237", "poitama-guide"],
      ["moppy-guide-1781566251638", "moppy-guide"],
      ["moppy-faq-1781701348705", "moppy-faq"],
    ];
    const articleRedirects = articleSlugFixes.map(([oldSlug, newSlug]) => ({
      source: `/articles/:cat/${oldSlug}`,
      destination: `/articles/:cat/${newSlug}`,
      permanent: true,
    }));

    return [
      { source: "/hello-world", destination: "/", permanent: true },
      { source: "/category/:slug*", destination: "/articles", permanent: true },
      ...categoryRedirects,
      ...articleRedirects,
    ];
  },
};

export default nextConfig;
