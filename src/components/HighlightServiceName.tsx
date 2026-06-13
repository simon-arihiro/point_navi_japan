type Props = {
  title: string;
  serviceName?: string | null;
};

// 記事タイトル内のサービス名部分を赤字で強調表示する
export default function HighlightServiceName({ title, serviceName }: Props) {
  if (!serviceName) return <>{title}</>;

  const idx = title.indexOf(serviceName);
  if (idx === -1) return <>{title}</>;

  return (
    <>
      {title.slice(0, idx)}
      <span className="text-red-600">{serviceName}</span>
      {title.slice(idx + serviceName.length)}
    </>
  );
}
