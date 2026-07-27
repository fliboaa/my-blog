import Container from "@/app/_components/container";
import { Hero } from "@/app/_components/hero";
import { FeaturedPost } from "@/app/_components/featured-post";
import { PostCard } from "@/app/_components/post-card";
import { CategoryGrid } from "@/app/_components/category-grid";
import { getAllPosts } from "@/lib/api";

export default function Index() {
  const allPosts = getAllPosts();
  const featured = allPosts.find((p) => p.featured) ?? allPosts[0];
  const rest = allPosts.filter((p) => p.slug !== featured.slug);

  // 按标签统计实际篇数
  const counts: Record<string, number> = {};
  allPosts.forEach((p) => {
    p.tags?.forEach((t) => {
      counts[t] = (counts[t] || 0) + 1;
    });
  });

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
        </section>

        <section id="categories" style={{ marginTop: 72 }}>
          <div className="eyebrow">按主题浏览</div>
          <h2 className="section-title">Browse By Category</h2>
          <p className="section-sub">挑你感兴趣的方向深入</p>
          <CategoryGrid counts={counts} />
        </section>
      </Container>
    </>
  );
}
