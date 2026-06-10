type Props = {
  className?: string;
};

// ポイ活ナビのマスコット（コインキャラクター）。ヘッダー・フッター・Hero で使用。
export default function Mascot({ className = "w-8 h-8" }: Props) {
  return (
    <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="11" fill="none" stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.6" />
      <circle cx="12.5" cy="14.5" r="1.5" fill="#78350F" />
      <circle cx="19.5" cy="14.5" r="1.5" fill="#78350F" />
      <path d="M11.5 19 Q16 23 20.5 19" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M24 4.5 L25 7 L27.5 8 L25 9 L24 11.5 L23 9 L20.5 8 L23 7 Z" fill="#FEF3C7" />
    </svg>
  );
}
