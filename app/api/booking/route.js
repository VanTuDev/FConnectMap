import { NextResponse } from "next/server";
import { getPlaceById } from "@/data/places";

export const runtime = "nodejs";

// Mock đặt bàn — không lưu thật, chỉ trả mã đặt chỗ giả lập.
export async function POST(req) {
  const body = await req.json();
  const { placeId, name, phone, date, time, guests } = body || {};

  const place = getPlaceById(placeId);
  if (!place) {
    return NextResponse.json({ error: "Không tìm thấy quán." }, { status: 404 });
  }
  if (!name || !phone || !date || !time || !guests) {
    return NextResponse.json(
      { error: "Vui lòng điền đầy đủ thông tin." },
      { status: 400 }
    );
  }

  // Giả lập độ trễ xử lý
  await new Promise((r) => setTimeout(r, 600));

  const code =
    "FC" + Math.random().toString(36).slice(2, 8).toUpperCase();

  return NextResponse.json({
    success: true,
    booking: {
      code,
      placeName: place.name,
      name,
      phone,
      date,
      time,
      guests,
    },
  });
}
