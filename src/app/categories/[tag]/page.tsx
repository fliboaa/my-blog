import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts } from "@/lib/api";
import { SLUG_TAG, TAG_META } from "@/lib/tags";
import { PostListPagination } from "@/app/_components/post-list-pagination";

const PAGE_SIZE = 2;

type Props = {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function CategoryPage(props: Props) {
  const { tag: slug } = await props.params;
  const { page: pageStr } = await props.searchParams;
  const tag = SLUG_TAG[slug];
  if (!tag) return notFound();

  const all = getAllPosts().filter((p) => p.tags?.includes(tag));
  const meta = TAG_META[tag];
  const page = Math.max(1, parseInt(pageStr || "1", 10));
  const totalPages = Math.ceil(all.length / PAGE_SIZE);
  const curPage = Math.min(page, totalPages || 1);
  const posts = all.slice((curPage - 1) * PAGE_SIZE, curPage * PAGE_SIZE);

  return (
    <div className="container cat-page">
      <a href="/" className="back-home">← 返回首页</a>
      <div className="cat-page-head">
        <div className="cat-page-icon">{meta.icon}</div>
        <h1 className="cat-page-title">{tag}</h1>
        <p className="cat-page-desc">{meta.desc} · 共 {all.length} 篇</p>
      </div>
      <div className="cat-list">
        {posts.map((p) => (
          <a key={p.slug} href={`/posts/${p.slug}`} className="card">
            <div className="card-tags">
              <span className={`tag tag-${tagClass(tag)}`}>{tag}</span>
            </div>
            <h3>{p.title}</h3>
            <p>{p.excerpt}</p>
            <div className="card-meta">
              <span>{p.date}</span>
              <span className="dot" />
              <span>{p.readingTime}</span>
            </div>
          </a>
        ))}
      </div>
      <PostListPagination
        curPage={curPage}
        totalPages={totalPages}
        baseHref={`/categories/${slug}`}
      />
    </div>
  );
}

function tagClass(tag: string) {
  return (
    { 智能体: "agent", "LLM 基础": "llm", 产品方法论: "pm", 实战工程: "eng" } as Record<string, string>
  )[tag] || "agent";
}

export function generateStaticParams() {
  return Object.keys(SLUG_TAG).map((slug) => ({ tag: slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { tag: slug } = await props.params;
  const tag = SLUG_TAG[slug];
  if (!tag) return {};
  return { title: `${tag} | Aaron's Blog`, description: TAG_META[tag].desc };
}
