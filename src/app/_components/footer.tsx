import Container from "./container";

export function Footer() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="foot-inner">
          <div>© 2026 Aaron · 记录搞懂每件事的过程</div>
          <div className="foot-links">
            <a href="#">GitHub</a>
            <a href="#">Twitter</a>
            <a href="#">RSS</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
