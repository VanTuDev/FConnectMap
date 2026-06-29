import Link from "next/link";

export default function Header() {
  return (
    <header className="site-header">
      <div className="container bar">
        <Link href="/" className="brand">
          <span className="dot" />
          FConnect
        </Link>
        <span className="nav-loc">Ngũ Hành Sơn, Đà Nẵng</span>
      </div>
    </header>
  );
}
