import { type Tag } from "@/interfaces/post";

type Cat = { icon: string; name: string; count: number };

const TAG_META: Record<Tag, { icon: string; name: string }> = {
  智能体: { icon: "🤖", name: "智能体" },
  "LLM 基础": { icon: "🧠", name: "LLM 基础" },
  产品方法论: { icon: "📊", name: "产品方法论" },
  实战工程: { icon: "🛠️", name: "实战工程" },
};

export function CategoryGrid({ counts }: { counts: Record<string, number> }) {
  const cats: Cat[] = (Object.keys(TAG_META) as Tag[])
    .map((tag) => ({
      ...TAG_META[tag],
      count: counts[tag] || 0,
    }))
    .filter((c) => c.count > 0);

  return (
    <div className="cats">
      {cats.map((c) => (
        <div key={c.name} className="cat">
          <div className="cat-icon">{c.icon}</div>
          <div className="cat-name">{c.name}</div>
          <div className="cat-count">{c.count} 篇</div>
        </div>
      ))}
    </div>
  );
}
