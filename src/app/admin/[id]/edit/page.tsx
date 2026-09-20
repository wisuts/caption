import Link from "next/link";
import { notFound } from "next/navigation";
import { CaptionForm } from "@/components/caption-form";
import { getCaptionByIdDb } from "@/lib/db/queries";
import { getLatestSubmittedVersion } from "@/lib/caption-helpers";

export default async function EditCaptionPage({
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

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-space-lg px-gutter-desktop py-space-xl">
      <Link
        href={`/admin/${caption.id}`}
        className="w-fit text-body-sm font-medium text-on-surface-variant hover:text-primary"
      >
        ← กลับหน้ารายละเอียด
      </Link>
      <div className="flex flex-col gap-space-xs">
        <h1 className="text-headline-lg text-on-surface">แก้ไขแคปชัน</h1>
        <p className="text-body-md text-on-surface-variant">{caption.title}</p>
      </div>
      <CaptionForm
        initial={caption}
        reviewNotes={latestVersion?.notes}
        reviewedText={latestVersion?.text}
      />
    </main>
  );
}
