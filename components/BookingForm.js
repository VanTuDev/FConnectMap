"use client";

import { useState } from "react";

const TIME_SLOTS = [
  "11:00", "11:30", "12:00", "12:30",
  "17:30", "18:00", "18:30", "19:00", "19:30", "20:00",
];

export default function BookingForm({ placeId, placeName }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: today,
    time: "18:00",
    guests: "2",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null);

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit() {
    setError("");
    if (!form.name || !form.phone) {
      setError("Vui lòng nhập tên và số điện thoại.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Đặt bàn thất bại, thử lại nhé.");
      } else {
        setBooking(data.booking);
      }
    } catch {
      setError("Không kết nối được máy chủ.");
    } finally {
      setLoading(false);
    }
  }

  if (booking) {
    return (
      <div className="booking-card">
        <div className="booking-success">
          <div className="check">✓</div>
          <h3>Đặt bàn thành công</h3>
          <div className="code">{booking.code}</div>
          <p className="hint">
            {booking.placeName}
            <br />
            {booking.guests} khách · {booking.date} lúc {booking.time}
            <br />
            Quán sẽ gọi xác nhận qua {booking.phone}.
          </p>
          <button
            className="btn-primary"
            style={{ marginTop: 16 }}
            onClick={() => setBooking(null)}
          >
            Đặt bàn khác
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-card">
      <h3>Đặt bàn</h3>
      <p className="hint">Giữ chỗ tại {placeName} (demo — không tính phí)</p>

      <div className="field">
        <label>Họ tên</label>
        <input
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Nguyễn Văn A"
        />
      </div>
      <div className="field">
        <label>Số điện thoại</label>
        <input
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="09xx xxx xxx"
          inputMode="tel"
        />
      </div>
      <div className="field-row">
        <div className="field">
          <label>Ngày</label>
          <input
            type="date"
            value={form.date}
            min={today}
            onChange={(e) => update("date", e.target.value)}
          />
        </div>
        <div className="field">
          <label>Giờ</label>
          <select
            value={form.time}
            onChange={(e) => update("time", e.target.value)}
          >
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label>Số khách</label>
        <select
          value={form.guests}
          onChange={(e) => update("guests", e.target.value)}
        >
          {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
            <option key={n} value={n}>
              {n} người
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="error-box" style={{ marginTop: 4 }}>
          {error}
        </div>
      ) : null}

      <button className="btn-primary" onClick={submit} disabled={loading}>
        {loading ? "Đang giữ chỗ…" : "Xác nhận đặt bàn"}
      </button>
    </div>
  );
}
