import { type Tag } from "@/interfaces/post";

export function TagBadge({ tag }: { tag: Tag }) {
  const cls =
    tag === "智能体"
      ? "tag-agent"
      : tag === "LLM 基础"
        ? "tag-llm"
        : tag === "产品方法论"
          ? "tag-pm"
          : "tag-eng";
  return <span className={`tag ${cls}`}>{tag}</span>;
}
