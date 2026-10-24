import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandBadges } from "@/components/brand-badge";
import { ChannelBadge } from "@/components/channel-badge";
import { StatusBadge } from "@/components/status-badge";
import { VersionTimeline } from "@/components/version-timeline";
import { VersionCaptionCard } from "@/components/version-caption-card";
import { buttonVariants } from "@/components/ui/button";
import { SubmitNewVersionButton } from "@/components/submit-new-version-button";
import { MarkPublishedButton } from "@/components/mark-published-button";
import { DeleteCaptionButton } from "@/components/delete-caption-button";
import { CaptionImage } from "@/components/caption-image";
import { CopyCaptionButton } from "@/components/copy-caption-button";
import { getCaptionByIdDb } from "@/lib/db/queries";
import { getLatestSubmittedVersion, hasUnsentEdit } from "@/lib/caption-helpers";
import { formatThaiDate, formatThaiDateTime } from "@/lib/thai-date";

// หน้ารายละเอียดชิ้นงาน ฝั่งเจ้าของ (PRD 5.3) — ต้อง login (จะป้องกันจริงใน Phase 8)
export default async function AdminItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const caption = await getCaptionByIdDb(id);

  if (!caption) {
    notFound();
  }

  const latestVersion = getLatestSubmittedVersion(caption);
  const earlierVersions = latestVersion
    ? caption.versions.filter((v) => v.versionNumber !== latestVersion.versionNumber)
    : caption.versions;
  const unsentEdit = hasUnsentEdit(caption);
  const canSubmitNewVersion =
    caption.status === "draft" ||
    caption.status === "changes_requested" ||
    unsentEdit;
  const canMarkPublished = caption.status === "approved";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-space-lg px-gutter-desktop py-space-xl">
      <Link
        href="/admin"
        className="w-fit text-body-sm font-medium text-on-surface-variant hover:text-primary"
      >
        ← กลับหน้ารวมงาน
      </Link>

      {unsentEdit && (
        <div className="flex flex-col gap-space-xs rounded-xl bg-amber-50 p-space-md text-amber-900 shadow-sm">
          <p className="font-semibold">
            แก้แล้วแต่ยังไม่ได้ส่งตรวจ — ตอนนี้หัวหน้ายังเห็นเวอร์ชันก่อนหน้าอยู่
          </p>
          <p className="text-body-sm">
            กดปุ่ม “ส่งเวอร์ชันใหม่ให้ตรวจ” ด้านล่างเมื่อพร้อมให้หัวหน้าตรวจข้อความล่าสุด
          </p>
        </div>
      )}

      <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex flex-wrap items-center gap-space-xs">
            <BrandBadges brands={caption.brands} />
            <ChannelBadge channel={caption.channel} />
            <StatusBadge status={caption.status} />
          </div>
          <Link
            href={`/admin/${caption.id}/edit`}
            className={buttonVariants({ variant: "secondary" })}
          >
            แก้ไข
          </Link>
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
            <h2 className="text-headline-sm text-on-surface">รูปภาพประกอบแคปชัน</h2>
            {caption.imageUrl ? (
              <CaptionImage imageUrl={caption.imageUrl} />
            ) : (
              <p className="text-body-md text-on-surface-variant">ยังไม่ได้ใส่ลิงก์รูป</p>
            )}
          </section>

          <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            {latestVersion ? (
              <VersionCaptionCard
                version={latestVersion}
                headingOverride="ข้อความที่หัวหน้าเห็นอยู่ตอนนี้ (เวอร์ชันล่าสุดที่ส่งตรวจ)"
              />
            ) : (
              <>
                <h2 className="text-headline-sm text-on-surface">
                  ข้อความที่หัวหน้าเห็นอยู่ตอนนี้ (เวอร์ชันล่าสุดที่ส่งตรวจ)
                </h2>
                <p className="whitespace-pre-line rounded-lg bg-surface-container-low/40 p-space-lg text-body-lg text-on-surface">
                  ยังไม่มีเวอร์ชันที่ส่งตรวจ
                </p>
              </>
            )}
          </section>

          {unsentEdit && (
            <section className="flex flex-col gap-space-md rounded-xl border border-amber-200 bg-amber-50/60 p-space-lg">
              <div className="flex flex-wrap items-center justify-between gap-space-xs">
                <h2 className="text-headline-sm text-on-surface">
                  ข้อความที่แก้ค้างไว้ (ยังไม่ส่งตรวจ)
                </h2>
                <CopyCaptionButton text={caption.pendingDraftText} />
              </div>
              <p className="whitespace-pre-line rounded-lg bg-surface-container-lowest p-space-lg text-body-lg text-on-surface">
                {caption.pendingDraftText}
              </p>
            </section>
          )}
        </div>

        <div className="flex flex-col gap-space-lg lg:col-span-5 xl:col-span-4">
          <section className="flex flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-lg shadow-md">
            <h2 className="text-headline-sm text-on-surface">จัดการชิ้นงาน</h2>
            {canSubmitNewVersion && (
              <SubmitNewVersionButton captionId={caption.id} />
            )}
            {canMarkPublished && <MarkPublishedButton captionId={caption.id} />}
            <DeleteCaptionButton captionId={caption.id} />
          </section>

          <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <h2 className="text-headline-sm text-on-surface">เวอร์ชันก่อนหน้า</h2>
            {earlierVersions.length > 0 ? (
              <VersionTimeline versions={earlierVersions} />
            ) : (
              <p className="text-body-sm text-on-surface-variant">
                ยังไม่มีเวอร์ชันก่อนหน้า
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
