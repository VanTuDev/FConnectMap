import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import BookingForm from "@/components/BookingForm";
import { PLACES, getPlaceById, formatVND } from "@/data/places";

// Pre-render tất cả trang quán
export function generateStaticParams() {
  return PLACES.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }) {
  const place = getPlaceById(params.id);
  return { title: place ? `${place.name} — FConnect` : "FConnect" };
}

// Menu mô phỏng dựng từ highlights + vài món chung
function buildMenu(place) {
  const base = place.highlights.map((name, i) => ({
    name,
    price: place.priceFrom + i * 15000,
  }));
  return base;
}

export default function PlaceDetail({ params }) {
  const place = getPlaceById(params.id);
  if (!place) notFound();

  const menu = buildMenu(place);

  return (
    <>
      <Header />

      <div className="detail-hero">
        <Link href="/" className="back-link">
          ← Quay lại
        </Link>
        <img src={place.image} alt={place.name} />
        <div className="detail-title-wrap">
          <div className="container">
            <h1>{place.name}</h1>
            <div className="sub">
              <span className="star" style={{ color: "#f3c969" }}>
                ★ {place.rating}
              </span>
              <span>{place.category}</span>
              <span>{place.address}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="detail-grid">
          <div>
            <div className="block">
              <h2>Về quán</h2>
              <p style={{ color: "var(--ink-soft)", fontSize: 15.5 }}>
                {place.summary}
              </p>
            </div>

            <div className="block">
              <h2>Thông tin</h2>
              <div className="info-row">
                <span className="k">Giờ mở cửa</span>
                <span>{place.openHours}</span>
              </div>
              <div className="info-row">
                <span className="k">Khoảng giá</span>
                <span>
                  {formatVND(place.priceFrom)} – {formatVND(place.priceTo)} / người
                </span>
              </div>
              <div className="info-row">
                <span className="k">Tình trạng</span>
                <span>
                  {place.crowd === "Vắng"
                    ? "Còn nhiều chỗ trống"
                    : place.crowd === "Vừa"
                    ? "Lượng khách vừa phải"
                    : "Khá đông, nên đặt trước"}
                </span>
              </div>
              {place.phone ? (
                <div className="info-row">
                  <span className="k">Điện thoại</span>
                  <span>{place.phone}</span>
                </div>
              ) : null}
              <div className="info-row">
                <span className="k">Phù hợp</span>
                <span>{place.tags.join(", ")}</span>
              </div>
            </div>

            <div className="block">
              <h2>Vị trí trên bản đồ</h2>
              <div className="map-wrap">
                <iframe
                  src={`https://www.google.com/maps?q=${place.lat},${place.lng}&z=17&hl=vi&output=embed`}
                  width="100%"
                  height="280"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Bản đồ ${place.name}`}
                />
                <a
                  href={`https://www.google.com/maps?q=${place.lat},${place.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-link"
                >
                  📍 Mở trong Google Maps ↗
                </a>
              </div>
            </div>

            <div className="block">
              <h2>Món nổi bật</h2>
              <div className="menu-list">
                {menu.map((m) => (
                  <div className="menu-item" key={m.name}>
                    <span>{m.name}</span>
                    <strong>{formatVND(m.price)}</strong>
                  </div>
                ))}
              </div>
              <p
                style={{
                  fontSize: 12.5,
                  color: "var(--ink-soft)",
                  marginTop: 10,
                }}
              >
                * Giá mang tính tham khảo cho bản demo.
              </p>
            </div>
          </div>

          <aside>
            <BookingForm placeId={place.id} placeName={place.name} />
          </aside>
        </div>
      </div>

      <footer className="site-footer">
        <div className="container">
          FConnect · Demo F&B Discovery Platform · Ngũ Hành Sơn, Đà Nẵng
        </div>
      </footer>
    </>
  );
}
