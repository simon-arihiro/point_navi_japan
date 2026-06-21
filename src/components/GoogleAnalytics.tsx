"use client";

import { usePathname } from "next/navigation";

// GA4計測タグ。NEXT_PUBLIC_GA_ID が未設定の場合、または管理画面（/admin）配下では何も出力しない
// （/admin は運営者自身の操作であり訪問者の実際の行動ではないため計測対象から除外する。
// Search ConsoleのGA連携での所有権確認は、サーバーレンダリングされる静的HTML内にこのscriptタグが
// 出力され続けるため引き続き機能する）
export default function GoogleAnalytics() {
  const pathname = usePathname();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId || pathname?.startsWith("/admin")) return null;

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `,
        }}
      />
    </>
  );
}
