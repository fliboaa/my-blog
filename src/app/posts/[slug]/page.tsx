import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/api";
import markdownToHtml from "@/lib/markdownToHtml";
import { TagBadge } from "@/app/_components/tag-badge";
import DateFormatter from "@/app/_components/date-formatter";
import { TableOfContents } from "@/app/_components/table-of-contents";
import { ReadingProgress } from "@/app/_components/reading-progress";
import { MermaidRenderer } from "@/app/_components/mermaid-renderer";

export default async function Post(props: Params) {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const content = await markdownToHtml(post.content || "");
  const showToc = post.toc !== false;

  return (
    <>
      {showToc && <ReadingProgress />}
      <div className={`post-layout ${showToc ? "with-toc" : "no-toc"}`}>
        {showToc && <TableOfContents />}

        <div className="article-col">
          <a href="/" className="back-link">
            ← 返回文章列表
          </a>

          <div className="breadcrumb">
            <a href="/">首页</a>
          </div>

          {post.tags && (
            <div className="article-tags">
              {post.tags.map((t) => (
                <TagBadge key={t} tag={t} />
              ))}
            </div>
          )}

          <h1 className="article-title">{post.title}</h1>
          <p className="article-excerpt">{post.excerpt}</p>

          <div className="article-meta">
            <div className="avatar-dot" />
            <span>Aaron</span>
            <span className="dot" />
            <DateFormatter dateString={post.date} />
            {post.readingTime && (
              <>
                <span className="dot" />
                <span>{post.readingTime} 阅读</span>
              </>
            )}
          </div>

          <div className="prose" dangerouslySetInnerHTML={{ __html: content }} />

          <MermaidRenderer />

          <div className="article-footer">
            <div className="author-card">
              <div className="av" />
              <div>
                <div className="name">Aaron</div>
                <div className="bio">技术型产品经理，记录搞懂每件事的过程。</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  return {
    title: `${post.title} | Aaron's Blog`,
    description: post.excerpt,
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
