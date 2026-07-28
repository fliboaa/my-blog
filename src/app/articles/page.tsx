import { getAllPosts } from "@/lib/api";
import { TagBadge } from "@/app/_components/tag-badge";
import { PostListPagination } from "@/app/_components/post-list-pagination";
import { TAG_SLUG } from "@/lib/tags";

const PAGE_SIZE = 2;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function ArticlesPage(props: Props) {
  const { page: pageStr } = await props.searchParams;
  const all = getAllPosts();
  const page = Math.max(1, parseInt(pageStr || "1", 10));
  const totalPages = Math.ceil(all.length / PAGE_SIZE);
  const curPage = Math.min(page, totalPages || 1);
  const posts = all.slice((curPage - 1) * PAGE_SIZE, curPage * PAGE_SIZE);

  return (
    <div className="container cat-page">
      <a href="/" className="back-home">← 返回首页</a>
      <div className="cat-page-head">
        <div className="cat-page-icon">📚</div>
        <h1 className="cat-page-title">全部文章</h1>
        <p className="cat-page-desc">按时间倒序排列 · 共 {all.length} 篇</p>
      </div>
      <div className="cat-list">
        {posts.map((p) => (
          <a key={p.slug} href={`/posts/${p.slug}`} className="card">
            <div className="card-tags">
              {p.tags?.map((t) => <TagBadge key={t} tag={t} />)}
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
        baseHref="/articles"
      />
    </div>
  );
}
