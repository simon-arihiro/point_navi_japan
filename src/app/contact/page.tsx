import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = { title: "お問い合わせ" };

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-black text-gray-900 mb-4">お問い合わせ</h1>
      <p className="text-gray-600 mb-8 text-sm">
        サービス情報の誤り、掲載依頼、その他ご連絡はこちらからお願いします。
      </p>
      <ContactForm />
    </div>
  );
}
