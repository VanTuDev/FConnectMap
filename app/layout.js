import "./globals.css";

export const metadata = {
  title: "FConnect — Tìm quán theo cảm xúc, Ngũ Hành Sơn",
  description:
    "Nền tảng khám phá quán ăn & cafe ở Ngũ Hành Sơn, Đà Nẵng. Tìm đúng quán theo nhu cầu thực tế bằng AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;1,500&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
