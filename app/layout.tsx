import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RewardSystem — MindX",
    template: "%s | RewardSystem MindX",
  },
  description:
    "Hệ thống tích điểm đổi quà cho học viên MindX — theo dõi tiến trình học tập và đổi quà xứng đáng.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
