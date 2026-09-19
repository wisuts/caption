import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandBadge } from "@/components/brand-badge";
import { ChannelBadge } from "@/components/channel-badge";
import { StatusBadge } from "@/components/status-badge";
import { VersionTimeline } from "@/components/version-timeline";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getCaptionById, getLatestSubmittedVersion } from "@/lib/mock-data";
import { formatThaiDate, formatThaiDateTime } from "@/lib/thai-date";

// หน้ารายละเอียดชิ้นงาน ฝั่งหัวหน้า/สาธารณะ (PRD 4.2) — ไม่ต้อง login
export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const caption = getCaptionById(id);

  if (!caption) {
    notFound();
  }

  const latestVersion = getLatestSubmittedVersion(caption);
  const canReview = caption.status === "pending_review";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-space-lg px-gutter-desktop py-space-xl">
      <Link
        href="/"
        className="w-fit text-body-sm font-medium text-on-surface-variant hover:text-primary"
      >
        ← กลับไปหน้าคิวรอตรวจ
      </Link>

      <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <div className="flex flex-wrap items-center gap-space-xs">
          <BrandBadge brand={caption.brand} />
          <ChannelBadge channel={caption.channel} />
          <StatusBadge status={caption.status} />
        </div>
        <h1 className="text-headline-lg text-on-surface">{caption.title}</h1>
        <div className="grid grid-cols-2 gap-space-md rounded-lg bg-surface-container-low/50 p-space-md sm:grid-cols-4">
          <Meta
            label="กำหนดลง"
            value={
              caption.scheduledDate
                ? formatThaiDate(caption.scheduledDate)
                : "ยังไม่กำหนด"
            }
          />
          <Meta label="ชื่อคนเขียน" value={caption.authorName} />
          <Meta
            label="ส่งตรวจล่าสุดเมื่อ"
            value={
              latestVersion
                ? formatThaiDateTime(latestVersion.submittedAt)
                : "ยังไม่เคยส่งตรวจ"
            }
          />
          <Meta label="เวอร์ชันปัจจุบัน" value={`v${latestVersion?.versionNumber ?? "-"}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-12">
        <div className="flex flex-col gap-space-lg lg:col-span-7 xl:col-span-8">
          <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <h2 className="text-headline-sm text-on-surface">
              แคปชันเวอร์ชันส่งตรวจล่าสุด
            </h2>
            <p className="whitespace-pre-line rounded-lg bg-surface-container-low/40 p-space-lg text-body-lg text-on-surface">
              {latestVersion?.text ?? "ยังไม่มีเวอร์ชันที่ส่งตรวจ"}
            </p>
          </section>

          <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <h2 className="text-headline-sm text-on-surface">
              รูปภาพประกอบแคปชัน
            </h2>
            {caption.imageUrl ? (
              <a
                href={caption.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-primary-fixed px-space-md py-2 text-label-md font-medium text-on-primary-fixed hover:bg-primary-fixed-dim"
              >
                เปิดดูรูปประกอบ ↗
              </a>
            ) : (
              <p className="text-body-md text-on-surface-variant">
                ยังไม่ได้ใส่ลิงก์รูป
              </p>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-space-lg lg:col-span-5 xl:col-span-4">
          {canReview && (
            <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-md">
              <h2 className="text-headline-sm text-on-surface">การตรวจพิจารณา</h2>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="review-comment">
                  คอมเมนต์สำหรับผู้เขียน{" "}
                  <span className="text-error">* (บังคับถ้ากดขอแก้)</span>
                </Label>
                <Textarea
                  id="review-comment"
                  placeholder="พิมพ์สิ่งที่ต้องการให้แก้ไข..."
                  rows={4}
                />
              </div>
              <div className="flex flex-col gap-space-sm sm:flex-row">
                <Button variant="destructive" className="flex-1">
                  ขอแก้
                </Button>
                <Button className="flex-1">ผ่าน</Button>
              </div>
              <p className="text-body-sm text-on-surface-variant">
                เมื่อกดผ่านหรือขอแก้ ชิ้นงานจะบันทึกสถานะและหายจากคิวรอตรวจทันที
                (ปุ่มนี้ยังไม่ทำงานจริงใน Phase 1)
              </p>
            </section>
          )}

          <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <h2 className="text-headline-sm text-on-surface">ประวัติเวอร์ชัน</h2>
            {caption.versions.length > 0 ? (
              <VersionTimeline versions={caption.versions} />
            ) : (
              <p className="text-body-sm text-on-surface-variant">
                ยังไม่เคยส่งตรวจ
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-label-sm uppercase tracking-wide text-on-surface-variant">
        {label}
      </span>
      <span className="text-headline-sm text-on-surface">{value}</span>
    </div>
  );
}
