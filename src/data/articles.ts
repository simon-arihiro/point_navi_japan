export type Article = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: number;
  tags: string[];
  featured: boolean;
};

export const articles: Article[] = [
  {
    id: "beginner-guide",
    title: "ポイ活完全入門ガイド｜初心者でも月1万円以上貯める方法",
    excerpt: "ポイ活とは何か、どこから始めればよいか、効率よくポイントを貯める基本戦略を徹底解説します。",
    category: "入門",
    date: "2026-06-01",
    readTime: 8,
    tags: ["初心者", "基礎知識", "攻略法"],
    featured: true,
  },
  {
    id: "credit-card-strategy",
    title: "クレジットカードでポイント還元率を最大化する方法",
    excerpt: "どのカードを選ぶべきか、カードの組み合わせテクニック、年会費と還元率のバランスを解説。",
    category: "クレジットカード",
    date: "2026-05-25",
    readTime: 6,
    tags: ["クレカ", "還元率", "比較"],
    featured: true,
  },
  {
    id: "convenience-store-tips",
    title: "コンビニポイ活の極意｜nanaco・Ponta・dポイントを最大活用",
    excerpt: "毎日のコンビニ利用でポイントを積み上げる具体的な方法。電子マネーと組み合わせた上級テクニックも紹介。",
    category: "コンビニ",
    date: "2026-05-18",
    readTime: 5,
    tags: ["コンビニ", "nanaco", "Ponta"],
    featured: false,
  },
  {
    id: "rakuten-ecosystem",
    title: "楽天経済圏を攻略｜楽天サービスをフル活用してSPUを最大化",
    excerpt: "楽天市場、楽天カード、楽天銀行など楽天グループのサービスを組み合わせてポイント還元率を高める方法。",
    category: "楽天",
    date: "2026-05-10",
    readTime: 10,
    tags: ["楽天", "SPU", "経済圏"],
    featured: true,
  },
  {
    id: "point-exchange",
    title: "ポイント交換で価値を最大化｜交換先比較と注意点",
    excerpt: "貯めたポイントを最もお得に使う方法。ANAマイル・JALマイルへの交換、現金化の方法を解説。",
    category: "交換・使い方",
    date: "2026-05-03",
    readTime: 7,
    tags: ["ポイント交換", "マイル", "現金化"],
    featured: false,
  },
  {
    id: "online-shopping-tricks",
    title: "ポイントサイト経由で還元率アップ！おすすめのネット通販術",
    excerpt: "ハピタス・モッピーなどのポイントサイトを経由したネット通販で還元率を2倍以上にする方法。",
    category: "ネット通販",
    date: "2026-04-28",
    readTime: 6,
    tags: ["ポイントサイト", "ネット通販", "二重取り"],
    featured: false,
  },
];

export const articleCategories = ["すべて", "入門", "クレジットカード", "コンビニ", "楽天", "交換・使い方", "ネット通販"];
