import type { Metadata } from "next";

export const metadata: Metadata = { title: "プライバシーポリシー" };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-black text-gray-900 mb-8">プライバシーポリシー</h1>
      <div className="prose prose-sm text-gray-700 space-y-6">
        <p>本サイト（以下「当サイト」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めています。</p>
        <h2 className="text-lg font-bold text-gray-900">収集する情報</h2>
        <p>当サイトでは、サービス改善のためにアクセスログ（IPアドレス、ブラウザ情報、アクセスページ等）を収集しています。</p>
        <h2 className="text-lg font-bold text-gray-900">Cookieについて</h2>
        <p>当サイトでは、利便性向上のためCookieを使用しています。</p>
        <h2 className="text-lg font-bold text-gray-900">アフィリエイトについて</h2>
        <p>当サイトはアフィリエイトプログラムを利用しており、サービスへのリンクを経由して報酬を受け取ることがあります。</p>
        <h2 className="text-lg font-bold text-gray-900">お問い合わせ</h2>
        <p>プライバシーに関するお問い合わせは<a href="/contact" className="text-amber-700 hover:underline">お問い合わせページ</a>よりご連絡ください。</p>
      </div>
    </div>
  );
}
