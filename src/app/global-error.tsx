"use client";

// ด่านสุดท้าย เผื่อพังตั้งแต่โครงหน้าเว็บจนหน้า error ปกติก็ขึ้นไม่ได้
// ต้องมี html/body ของตัวเองเพราะโครงเดิมใช้ไม่ได้แล้ว
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="th">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "24px" }}>ตอนนี้เปิดเว็บไม่ได้</h1>
        <p>มีบางอย่างขัดข้องชั่วคราว ไม่ใช่ความผิดของคุณ งานที่บันทึกไว้ยังอยู่ครบ</p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "8px",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            background: "#4f46e5",
            color: "white",
            fontSize: "16px",
          }}
        >
          ลองใหม่อีกครั้ง
        </button>
      </body>
    </html>
  );
}
