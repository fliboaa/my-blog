import { type Tag } from "@/interfaces/post";

// Tag → URL slug 映射（URL 用英文，显示用中文）
export const TAG_SLUG: Record<Tag, string> = {
  智能体: "agent",
  "LLM 基础": "llm",
  产品方法论: "pm",
  实战工程: "engineering",
};

// slug → Tag 反查
export const SLUG_TAG: Record<string, Tag> = Object.fromEntries(
  (Object.entries(TAG_SLUG) as [Tag, string][]).map(([tag, slug]) => [
    slug,
    tag,
  ]),
);

// Tag → CSS 着色 class 映射（与 globals.css 的 .tag-* 对应）
export const TAG_CLASS: Record<Tag, string> = {
  智能体: "tag-agent",
  "LLM 基础": "tag-llm",
  产品方法论: "tag-pm",
  实战工程: "tag-eng",
};

export const TAG_META: Record<Tag, { icon: string; desc: string }> = {
  智能体: {
    icon: "🤖",
    desc: "Agent 原理、ReAct、Loop Engineering",
  },
  "LLM 基础": {
    icon: "🧠",
    desc: "Transformer、token、attention 等底层机制",
  },
  产品方法论: {
    icon: "📊",
    desc: "PM 转型、技术决策框架、评估体系",
  },
  实战工程: {
    icon: "🛠️",
    desc: "工具实践、Skill 设计、踩坑记录",
  },
};
