"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const json = await res.json();
      if (res.ok) {
        setSuccess(true);
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setError(json.error?.message ?? "送信に失敗しました");
      }
    } catch {
      setError("通信エラーが発生しました");
    }
    setSending(false);
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <p className="text-gray-900 font-bold mb-2">お問い合わせありがとうございます</p>
        <p className="text-gray-600 text-sm">内容を確認のうえ、必要に応じてご連絡いたします。</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
          お名前
          <span className="text-xs font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">任意</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
          メールアドレス
          <span className="text-xs font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">任意</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
          お問い合わせ内容
          <span className="text-xs font-normal text-white bg-red-500 px-1.5 py-0.5 rounded">必須</span>
        </label>
        <textarea
          rows={6}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={sending}
        className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
      >
        {sending ? "送信中..." : "送信する"}
      </button>
    </form>
  );
}
