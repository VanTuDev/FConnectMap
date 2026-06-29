import Link from "next/link";
import { formatVND } from "@/data/places";

export default function PlaceCard({ place }) {
  return (
    <article className="card">
      <div className="card-img">
        {/* dùng <img> thường để không phụ thuộc next/image config khi demo */}
        <img src={place.image} alt={place.name} loading="lazy" />
        <span className="card-cat">{place.category}</span>
        <span className={`card-crowd crowd-${place.crowd}`}>
          {place.crowd === "Vắng"
            ? "Còn nhiều chỗ"
            : place.crowd === "Vừa"
            ? "Vừa phải"
            : "Khá đông"}
        </span>
      </div>
      <div className="card-body">
        <h3>{place.name}</h3>
        <div className="card-meta">
          <span className="star">★ {place.rating}</span>
          <span>·</span>
          <span>{place.ratingCount} đánh giá</span>
          <span>·</span>
          <span>{place.openHours}</span>
        </div>
        <div className="card-addr">
          <span>{place.address}</span>
        </div>

        {place.aiReason ? (
          <div className="ai-reason">💡 {place.aiReason}</div>
        ) : null}

        <div className="card-tags">
          {place.tags.slice(0, 3).map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
        </div>

        <div className="card-foot">
          <div className="price">
            {formatVND(place.priceFrom)}
            <span> – {formatVND(place.priceTo)}</span>
          </div>
          <Link href={`/quan/${place.id}`} className="btn-ghost">
            Xem & đặt bàn
          </Link>
        </div>
      </div>
    </article>
  );
}
