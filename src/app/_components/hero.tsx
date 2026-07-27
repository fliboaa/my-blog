import Container from "./container";

export function Hero() {
  return (
    <Container>
      <section className="hero">
        <h1>
          记录搞懂每件事的
          <br />
          <span className="hl">学习过程</span>
        </h1>
        <p>
          这是 Aaron 的学习博客。技术型产品经理视角，记录我从不懂到搞懂 AI、智能体、产品设计的每一步——把摸索的过程写下来，附上能复用的理解。
        </p>
        <div className="hero-cta">
          <a href="#articles" className="btn-primary">
            开始阅读
          </a>
          <a href="#about" className="btn-ghost">
            关于我
          </a>
        </div>
      </section>
    </Container>
  );
}
