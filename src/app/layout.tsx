import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Sans_Thai } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

// IBM Plex Sans สำหรับข้อความอังกฤษ ตามที่กำหนดไว้ใน DESIGN.md
const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// IBM Plex Sans Thai สำหรับข้อความไทย (DESIGN.md ไม่รองรับภาษาไทยในฟอนต์หลัก
// จึงเสริมฟอนต์ไทยตามค่าเริ่มต้นของ CLAUDE.md)
const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: "--font-ibm-plex-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "คิวตรวจแคปชัน",
  description: "ระบบส่งแคปชันให้หัวหน้าตรวจ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${ibmPlexSans.variable} ${ibmPlexSansThai.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background">
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
