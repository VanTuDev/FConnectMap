import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { PLACES } from "@/data/places";

export const runtime = "nodejs";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("Missing GEMINI_API_KEY in environment variables");
}

const ai = new GoogleGenAI({ apiKey });

function buildCatalog() {
  return PLACES.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    address: p.address,
    rating: p.rating,
    priceFrom: p.priceFrom,
    priceTo: p.priceTo,
    moods: p.moods,
    crowd: p.crowd,
    openHours: p.openHours,
    tags: p.tags,
    highlights: p.highlights,
  }));
}

function extractJSON(text) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { return null; }
    }
    return null;
  }
}

// --- Fallback: tìm kiếm cục bộ khi AI không khả dụng ---
const MOOD_KEYWORDS = {
  study:      ["học", "làm việc", "work", "yên tĩnh", "wifi", "ổ cắm", "sinh viên"],
  date:       ["hẹn hò", "hẹn", "đôi", "cặp", "lãng mạn", "romantic"],
  group:      ["nhóm", "họp", "bạn bè", "đám", "tiệc", "nhiều người"],
  checkin:    ["check-in", "sống ảo", "ảnh", "đẹp", "chụp"],
  chill:      ["thư giãn", "chill", "nghỉ", "bình yên", "thoải mái"],
  seafood:    ["hải sản", "tôm", "cua", "cá", "mực", "sò", "ngao"],
  finedining: ["sang trọng", "fine dining", "cao cấp", "đặc biệt", "wine"],
};

function localSearch(query) {
  const q = query.toLowerCase();
  const budgetMatch = q.match(/(\d+)\s*k/i);
  const budget = budgetMatch ? parseInt(budgetMatch[1]) * 1000 : null;

  const scored = PLACES.map((p) => {
    let score = 0;
    const searchable = [
      p.name, p.category, p.summary, p.address,
      ...p.tags, ...p.highlights,
    ].join(" ").toLowerCase();

    for (const [mood, kwList] of Object.entries(MOOD_KEYWORDS)) {
      if (kwList.some((kw) => q.includes(kw)) && p.moods.includes(mood)) score += 10;
    }
    for (const word of q.split(/\s+/).filter((w) => w.length >= 2)) {
      if (searchable.includes(word)) score += 2;
    }
    if (budget) {
      if (p.priceFrom <= budget) score += 4;
      if (p.priceTo <= budget * 1.5) score += 2;
      if (p.priceFrom > budget * 2) score -= 6;
    }
    score += p.rating * 0.5;

    return { place: p, score };
  });

  return scored
    .filter((s) => s.score > 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((s) => ({ ...s.place, aiReason: "" }));
}

export async function POST(req) {
  let query = "";

  try {
    ({ query } = await req.json());

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Vui lòng nhập nhu cầu tìm kiếm." },
        { status: 400 }
      );
    }

    if (!apiKey) {
      const results = localSearch(query);
      return NextResponse.json({
        reply: "Chưa cấu hình API key — kết quả tìm theo từ khoá:",
        results,
        fallback: true,
      });
    }

    const prompt = `
Bạn là trợ lý AI của FConnect — nền tảng tìm quán ăn/cafe ở quận Ngũ Hành Sơn, Đà Nẵng.
Người dùng mô tả nhu cầu bằng ngôn ngữ tự nhiên (mood, ngân sách, số người, mục đích).
Từ DANH SÁCH QUÁN bên dưới, chọn tối đa 5 quán phù hợp NHẤT, xếp theo độ phù hợp giảm dần.

Quy tắc:
- CHỈ chọn quán có trong danh sách. Không bịa quán mới.
- Cân nhắc: mục đích (học/hẹn hò/nhóm/check-in/hải sản...), ngân sách, số người, không gian.
- Nếu người dùng nói ngân sách, ưu tiên quán có khoảng giá phù hợp.
- Trả lời DUY NHẤT một object JSON, KHÔNG có markdown, KHÔNG có text thừa.

Định dạng JSON bắt buộc:
{
  "reply": "một câu ngắn thân thiện tóm tắt gợi ý (tiếng Việt)",
  "results": [
    { "id": "id-quan", "reason": "lý do ngắn gọn vì sao hợp (1 câu, tiếng Việt)" }
  ]
}

DANH SÁCH QUÁN:
${JSON.stringify(buildCatalog(), null, 2)}

Câu hỏi của người dùng: "${query}"
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text;
    const parsed = extractJSON(text);

    if (!parsed || !Array.isArray(parsed.results)) {
      return NextResponse.json(
        { error: "Không đọc được kết quả từ AI. Thử lại nhé." },
        { status: 502 }
      );
    }

    const byId = Object.fromEntries(PLACES.map((p) => [p.id, p]));
    const results = parsed.results
      .map((r) => {
        const place = byId[r.id];
        return place ? { ...place, aiReason: r.reason || "" } : null;
      })
      .filter(Boolean);

    return NextResponse.json({
      reply: parsed.reply || "Đây là vài gợi ý cho bạn:",
      results,
    });
  } catch (error) {
    console.error("Error in /api/search:", error);

    // Fallback khi AI lỗi (quota, network, ...)
    const results = localSearch(query);
    if (results.length === 0) {
      return NextResponse.json(
        { error: "AI đang bận và không tìm được quán phù hợp. Thử mô tả khác nhé." },
        { status: 200 }
      );
    }
    return NextResponse.json({
      reply: "AI đang bận — kết quả tìm theo từ khoá:",
      results,
      fallback: true,
    });
  }
}
