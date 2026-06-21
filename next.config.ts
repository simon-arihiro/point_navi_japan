import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // 旧WordPressサイト時代に存在していたURL（Google検索結果にまだ残存）を新しいページへ301リダイレクトする
  async redirects() {
    return [
      { source: "/hello-world", destination: "/", permanent: true },
      { source: "/category/:slug*", destination: "/articles", permanent: true },
    ];
  },
};

export default nextConfig;
