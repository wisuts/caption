import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandBadge } from "@/components/brand-badge";
import { ChannelBadge } from "@/components/channel-badge";
import { StatusBadge } from "@/components/status-badge";
import { VersionTimeline } from "@/components/version-timeline";
import { VersionCaptionCard } from "@/components/version-caption-card";
import { ReviewWorkspace } from "@/components/review-workspace";
import { getCaptionByIdDb } from "@/lib/db/queries";
import {
  getLatestSubmittedVersion,
  getPreviousVersion,
} from "@/lib/caption-helpers";
import { formatThaiDate, formatThaiDateTime } from "@/lib/thai-date";

// หน้ารายละเอียดชิ้นงาน ฝั่งหัวหน้า/สาธารณะ (PRD 4.2) — ไม่ต้อง login
// ต้องดึงข้อมูลสดทุกครั้ง ห้าม cache แบบหน้า static เพราะข้อมูลเปลี่ยนบ่อย
export const dynamic = "force-dynamic";

export default async function ItemDetailPage({
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
  const previousVersion = getPreviousVersion(caption);
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

      {canReview && latestVersion ? (
        <div className="flex flex-col gap-space-lg">
          <ReviewWorkspace
            captionId={caption.id}
            versionNumber={latestVersion.versionNumber}
            text={latestVersion.text}
            versions={caption.versions}
            previousVersionNumber={previousVersion?.versionNumber}
            previousText={previousVersion?.text}
            previousNotes={previousVersion?.notes}
          />

          <ImageSection imageUrl={caption.imageUrl} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-12">
          <div className="flex flex-col gap-space-lg lg:col-span-7 xl:col-span-8">
            <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
              {latestVersion ? (
                <VersionCaptionCard
                  version={latestVersion}
                  headingOverride="แคปชันเวอร์ชันส่งตรวจล่าสุด"
                />
              ) : (
                <>
                  <h2 className="text-headline-sm text-on-surface">
                    แคปชันเวอร์ชันส่งตรวจล่าสุด
                  </h2>
                  <p className="whitespace-pre-line rounded-lg bg-surface-container-low/40 p-space-lg text-body-lg text-on-surface">
                    ยังไม่มีเวอร์ชันที่ส่งตรวจ
                  </p>
                </>
              )}
            </section>

            <ImageSection imageUrl={caption.imageUrl} />
          </div>

          <div className="flex flex-col gap-space-lg lg:col-span-5 xl:col-span-4">
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
      )}
    </main>
  );
}

function ImageSection({ imageUrl }: { imageUrl: string | null }) {
  return (
    <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
      <h2 className="text-headline-sm text-on-surface">รูปภาพประกอบแคปชัน</h2>
      {imageUrl ? (
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-primary-fixed px-space-md py-2 text-label-md font-medium text-on-primary-fixed hover:bg-primary-fixed-dim"
        >
          เปิดดูรูปประกอบ ↗
        </a>
      ) : (
        <p className="text-body-md text-on-surface-variant">ยังไม่ได้ใส่ลิงก์รูป</p>
      )}
    </section>
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
