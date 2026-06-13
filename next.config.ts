import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // sharpはネイティブバイナリ(libvips)を含むため、Turbopackでバンドルすると
  // Vercelのサーバーレス実行時に ERR_DLOPEN_FAILED で読み込み失敗する。
  // node_modulesから直接読み込ませることで回避する。
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
