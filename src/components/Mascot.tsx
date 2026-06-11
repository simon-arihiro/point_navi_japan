type Props = {
  className?: string;
};

// ポイナビのマスコット（リス）。ヘッダー・フッターのロゴで使用。
export default function Mascot({ className = "w-8 h-8" }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/mascot/poinavi-logo-v2.png" alt="" className={`${className} object-contain shrink-0`} />
  );
}
