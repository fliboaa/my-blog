import type { NextRequest } from "next/server";
import { getAllPostMeta } from "@/lib/api";

/**
 * 搜索索引 —— 构建时静态生成一个精简 JSON 文件。
 * SearchBox 客户端组件在用户首次聚焦搜索框时 fetch 这个文件,
 * 而不是通过 RSC payload 把全量文章元数据塞进每个页面。
 *
 * 只包含搜索必需的 4 个字段,体积最小化。
 */
export const dynamic = "force-static";

type SearchItem = {
  slug: string;
  title: string;
  date: string;
  tags?: string[];
  readingTime?: string;
};

export async function GET(_req: NextRequest) {
  const items: SearchItem[] = getAllPostMeta().map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    tags: p.tags,
    readingTime: p.readingTime,
  }));

  return Response.json(items);
}
