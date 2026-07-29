import Container from "@/app/_components/container";
import { Hero } from "@/app/_components/hero";
import { FeaturedPost } from "@/app/_components/featured-post";
import { PostCard } from "@/app/_components/post-card";
import { getAllPostMeta } from "@/lib/api";

export default function Index() {
  const allPosts = getAllPostMeta();
  const featured = allPosts.find((p) => p.featured) ?? allPosts[0];
  // 首页只展示 Featured + 4 张卡片，其余在 /articles 浏览
  const rest = allPosts.filter((p) => p.slug !== featured.slug).slice(0, 4);
  const hasMore = allPosts.length > rest.length + 1;

  return (
    <>
      <Hero />
      <Container>
        <section id="articles">
          <div className="eyebrow">最新文章</div>
          <h2 className="section-title">最近在学什么</h2>
          <p className="section-sub">每一篇都是我搞懂一个概念的过程记录</p>

          <FeaturedPost post={featured} />

          {rest.length > 0 && (
            <div className="grid">
              {rest.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="view-all">
              <a href="/articles" className="btn-ghost">
                查看全部文章 →
              </a>
            </div>
          )}
        </section>
      </Container>
    </>
  );
}
