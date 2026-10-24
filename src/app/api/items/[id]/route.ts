import { NextResponse } from "next/server";
import { getCaptionByIdDb } from "@/lib/db/queries";
import { getLatestSubmittedVersion } from "@/lib/caption-helpers";
import { parseImageUrls, toPreviewImageUrl } from "@/lib/image-url";

/**
 * ลิงก์ข้อมูลสำหรับเครื่องอ่าน (PRD 4.4)
 *
 * ตัวเซทโพสต์เคยต้องดึงหน้าเว็บแล้วแกะ HTML เอาเอง ซึ่งพังทุกครั้งที่หน้าตาเว็บเปลี่ยน
 * ตรงนี้คืนข้อมูลเป็นชุดตายตัว ไม่ผูกกับหน้าตา แก้เว็บยังไงก็ไม่กระทบ
 *
 * เปิดสาธารณะเท่ากับหน้า /items/<id> ที่เปิดอยู่แล้ว ไม่ได้เปิดข้อมูลเพิ่มจากเดิม
 */
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const caption = await getCaptionByIdDb(id);

  if (!caption) {
    return NextResponse.json(
      { error: "not_found", message: "ไม่พบชิ้นงานนี้ อาจถูกลบไปแล้ว" },
      { status: 404 }
    );
  }

  const latest = getLatestSubmittedVersion(caption);
  const imageUrls = parseImageUrls(caption.imageUrl);

  return NextResponse.json({
    id: caption.id,
    title: caption.title,
    status: caption.status,
    brands: caption.brands,
    channel: caption.channel,
    scheduledDate: caption.scheduledDate,
    authorName: caption.authorName,

    // ข้อความที่ "ส่งตรวจแล้ว" ล่าสุด — ตัวนี้คือของที่เอาไปโพสต์
    caption: latest?.text ?? "",
    versionNumber: latest?.versionNumber ?? null,
    reviewResult: latest?.reviewResult ?? null,

    // ข้อความที่กำลังแก้ค้างไว้ ยังไม่ได้ส่งตรวจ (ปกติไม่ได้ใช้ตอนโพสต์)
    draftCaption: caption.pendingDraftText,

    images: imageUrls.map((url) => ({
      /** ลิงก์ที่ผู้ใช้วางไว้ เปิดดูในเบราว์เซอร์ได้ */
      sourceUrl: url,
      /** ลิงก์ไฟล์รูปตรง ๆ โหลดไปใช้ได้เลย (แปลงลิงก์ Google Drive ให้แล้ว) */
      directUrl: toPreviewImageUrl(url),
    })),

    notes:
      latest?.notes.map((n) => ({
        quotedText: n.quotedText,
        note: n.note,
      })) ?? [],

    webUrl: `/items/${caption.id}`,
    updatedAt: caption.updatedAt,
  });
}
