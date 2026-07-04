import { refreshTitleDate } from "@/lib/markdown";

type Props = {
  title: string;
  serviceName?: string | null;
};

// 記事タイトル内のサービス名部分を赤字で強調表示する
export default function HighlightServiceName({ title, serviceName }: Props) {
  const t = refreshTitleDate(title);
  if (!serviceName) return <>{t}</>;

  const idx = t.indexOf(serviceName);
  if (idx === -1) return <>{t}</>;

  return (
    <>
      {t.slice(0, idx)}
      <span className="text-red-600">{serviceName}</span>
      {t.slice(idx + serviceName.length)}
    </>
  );
}
