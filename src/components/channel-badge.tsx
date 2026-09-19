import type { Channel } from "@/lib/types";

// สีของแต่ละแพลตฟอร์ม (Facebook) ใช้สีแบรนด์จริงของแพลตฟอร์ม ไม่ใช่ธีมของเรา
// จึงไม่ได้ผูกกับโทนสีใน DESIGN.md เหมือนป้ายอื่น
const CHANNEL_STYLE: Record<Channel, string> = {
  Facebook: "bg-[#1877F2]/15 text-[#1877F2]",
};

export function ChannelBadge({ channel }: { channel: Channel }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-label-sm font-semibold ${CHANNEL_STYLE[channel]}`}
    >
      {channel}
    </span>
  );
}
