"use client";

import { useState } from "react";
import Header from "@/components/Header";
import PlaceCard from "@/components/PlaceCard";
import { PLACES, MOODS } from "@/data/places";

const EXAMPLES = [
  "Quán cafe yên tĩnh để học bài, ngân sách dưới 50k",
  "Nhà hàng hải sản cho nhóm 6 người",
  "Quán check-in đẹp để hẹn hò buổi tối",
  "Chỗ ăn tối sang trọng cho dịp đặc biệt",
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [isFallback, setIsFallback] = useState(false);
  const [results, setResults] = useState(null); // null = chưa search

  async function runSearch(q) {
    const text = (q ?? query).trim();
    if (!text) return;
    setLoading(true);
    setError("");
    setAiReply("");
    setIsFallback(false);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Có lỗi xảy ra, thử lại nhé.");
        setResults([]);
      } else {
        setAiReply(data.reply || "");
        setIsFallback(data.fallback === true);
        setResults(data.results || []);
      }
    } catch {
      setError("Không kết nối được tới máy chủ. Kiểm tra mạng và thử lại.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleMood(mood) {
    const q = `Tìm ${mood.label.toLowerCase()} ở Ngũ Hành Sơn`;
    setQuery(q);
    runSearch(q);
  }

  function handleKey(e) {
    if (e.key === "Enter") runSearch();
  }

  return (
    <>
      <Header />

      <section className="hero">
        <div className="container hero-inner">
          <span className="eyebrow">F&B Discovery · AI cá nhân hoá</span>
          <h1>
            Tìm đúng quán theo <em>cảm xúc</em>,
            <br /> không phải theo từ khoá
          </h1>
          <p className="lead">
            Mô tả điều bạn muốn — học bài, hẹn hò, họp nhóm hay đổi gió — AI sẽ
            chọn quán hợp nhất ở Ngũ Hành Sơn cho bạn.
          </p>

          <div className="search-wrap">
            <div className="search-box">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder="VD: quán cafe yên tĩnh để học, dưới 50k…"
                aria-label="Mô tả nhu cầu của bạn"
              />
              <button
                className="btn-search"
                onClick={() => runSearch()}
                disabled={loading}
              >
                {loading ? "Đang tìm…" : "Tìm với AI"}
              </button>
            </div>

            <div className="chips">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  className="chip"
                  onClick={() => handleMood(m)}
                  disabled={loading}
                >
                  <span>{m.emoji}</span>
                  {m.label}
                </button>
              ))}
            </div>

            <div className="suggest-line">
              Thử:{" "}
              {EXAMPLES.map((ex, i) => (
                <span key={ex}>
                  <button
                    onClick={() => {
                      setQuery(ex);
                      runSearch(ex);
                    }}
                  >
                    {ex}
                  </button>
                  {i < EXAMPLES.length - 1 ? " · " : ""}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="container">
        {error ? <div className="error-box">⚠️ {error}</div> : null}

        {aiReply ? (
          <div className={`ai-reply${isFallback ? " ai-reply--fallback" : ""}`}>
            <div className="spark">{isFallback ? "🔍" : "✦"}</div>
            <div>
              <div className="label">
                {isFallback ? "Tìm theo từ khoá" : "Gợi ý từ AI"}
              </div>
              <p>{aiReply}</p>
              {isFallback && (
                <p className="fallback-hint">
                  AI đang hết quota — kết quả là tìm kiếm nhanh theo từ khoá.
                  Thay key Gemini mới để dùng AI đầy đủ.
                </p>
              )}
            </div>
          </div>
        ) : null}

        {loading ? (
          <>
            <div className="section-head">
              <h2>Đang tìm quán phù hợp…</h2>
            </div>
            <div className="grid">
              {[1, 2, 3].map((i) => (
                <div className="skeleton" key={i} />
              ))}
            </div>
          </>
        ) : results === null ? (
          // Trạng thái đầu: hiển thị tất cả quán
          <>
            <div className="section-head">
              <h2>Khám phá quán ở Ngũ Hành Sơn</h2>
              <span className="count">{PLACES.length} địa điểm</span>
            </div>
            <div className="grid">
              {PLACES.map((p) => (
                <PlaceCard key={p.id} place={p} />
              ))}
            </div>
          </>
        ) : results.length > 0 ? (
          <>
            <div className="section-head">
              <h2>Gợi ý cho bạn</h2>
              <span className="count">{results.length} quán phù hợp</span>
            </div>
            <div className="grid">
              {results.map((p) => (
                <PlaceCard key={p.id} place={p} />
              ))}
            </div>
          </>
        ) : (
          !error && (
            <div className="error-box">
              Chưa tìm được quán phù hợp. Thử mô tả khác xem sao nhé.
            </div>
          )
        )}
      </main>

      <footer className="site-footer">
        <div className="container">
          FConnect · Demo F&B Discovery Platform · Ngũ Hành Sơn, Đà Nẵng
        </div>
      </footer>
    </>
  );
}
