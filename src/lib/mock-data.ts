import type { Caption } from "@/lib/types";

// ข้อมูลตัวอย่างสำหรับ Phase 1 เท่านั้น (ยังไม่ต่อฐานข้อมูลจริง)
// ตั้งใจให้ครอบคลุมทุกสถานะ และเคสพิเศษที่ PRD พูดถึง:
// - ชิ้นที่มีการแก้ค้างยังไม่ได้ส่งตรวจ (FS-002)
// - ชิ้นที่เคยขอแก้แล้วส่งเวอร์ชันใหม่ ประวัติเก่ายังอยู่ครบ (FS-003)
// - ชิ้นที่กำหนดลงว่างเปล่า (SP-004)

export const MOCK_CAPTIONS: Caption[] = [
  {
    id: "fs-001",
    title: "เปิดตัวคอร์ส AI Data Analyst ลดราคา 50% รับเปิดเทอม",
    brand: "FutureSkill",
    channel: "Facebook",
    scheduledDate: "2026-10-24",
    authorName: "กานต์รวี วงศ์สวัสดิ์",
    imageUrl: "https://drive.google.com/drive/folders/example-fs-001",
    status: "pending_review",
    pendingDraftText:
      "🔥 สิ้นสุดการรอคอย! เปิดตัวคอร์สใหม่แกะกล่อง 'AI Data Analyst Bootcamp 2024'\n\nยุคนี้แค่เปิด Excel วิเคราะห์ตัวเลขอาจไม่ทันการอีกต่อไป เมื่อ AI สามารถช่วยคุณคลีนข้อมูล ทำ Visualization และหา Business Insights ได้ในไม่กี่วินาที!\n\n✅ พื้นฐาน Data Analytics ด้วย Python และ SQL\n✅ Prompt Engineering กับ Advanced LLM\n✅ Workshop ทำ Dashboard เชื่อมต่อ Power BI\n\n💥 พิเศษ Early Bird ลดทันที 50% เหลือเพียง 2,490.- (จากปกติ 4,990.-)\n📅 เรียนสดออนไลน์ผ่าน Zoom พร้อมย้อนดูได้ตลอดชีพ\n\n#FutureSkill #DataAnalyst #AIforBusiness",
    createdAt: "2026-09-18T14:20:00+07:00",
    updatedAt: "2026-09-19T14:20:00+07:00",
    versions: [
      {
        versionNumber: 1,
        text:
          "🔥 สิ้นสุดการรอคอย! เปิดตัวคอร์สใหม่แกะกล่อง 'AI Data Analyst Bootcamp 2024'\n\nยุคนี้แค่เปิด Excel วิเคราะห์ตัวเลขอาจไม่ทันการอีกต่อไป เมื่อ AI สามารถช่วยคุณคลีนข้อมูล ทำ Visualization และหา Business Insights ได้ในไม่กี่วินาที!\n\n✅ พื้นฐาน Data Analytics ด้วย Python และ SQL\n✅ Prompt Engineering กับ Advanced LLM\n✅ Workshop ทำ Dashboard เชื่อมต่อ Power BI\n\n💥 พิเศษ Early Bird ลดทันที 50% เหลือเพียง 2,490.- (จากปกติ 4,990.-)\n📅 เรียนสดออนไลน์ผ่าน Zoom พร้อมย้อนดูได้ตลอดชีพ\n\n#FutureSkill #DataAnalyst #AIforBusiness",
        submittedAt: "2026-09-19T14:20:00+07:00",
        reviewResult: "pending",
        reviewComment: null,
        reviewedAt: null,
      },
    ],
  },
  {
    id: "sp-002",
    title: "SkillPass สรุป 5 ทักษะแห่งอนาคตที่องค์กรต้องการปี 2026",
    brand: "SkillPass",
    channel: "Facebook",
    scheduledDate: "2026-10-25",
    authorName: "ภัทรพล มานะกิจ",
    imageUrl: "https://drive.google.com/drive/folders/example-sp-002",
    status: "pending_review",
    // มีการแก้ค้างไว้แล้ว แต่ยังไม่กดส่งตรวจ — หัวหน้าจะยังเห็นข้อความเวอร์ชัน 1 อยู่
    pendingDraftText:
      "SkillPass สรุป 5 ทักษะแห่งอนาคตที่องค์กรต้องการปี 2026 (แก้หัวข้อให้กระชับแล้ว)\n\n1. การวิเคราะห์ข้อมูล\n2. ความคิดสร้างสรรค์\n3. การสื่อสารข้ามวัฒนธรรม\n4. การใช้ AI ร่วมกับงาน\n5. การบริหารเวลา\n\n#SkillPass #FutureSkills2026",
    createdAt: "2026-09-19T13:30:00+07:00",
    updatedAt: "2026-09-19T15:05:00+07:00",
    versions: [
      {
        versionNumber: 1,
        text:
          "SkillPass สรุป 5 ทักษะแห่งอนาคตที่องค์กรต้องการปี 2026\n\n1. การวิเคราะห์ข้อมูล\n2. ความคิดสร้างสรรค์\n3. การสื่อสารข้ามวัฒนธรรม\n4. การใช้ AI ร่วมกับงาน\n5. การบริหารเวลา\n\n#SkillPass #FutureSkills2026",
        submittedAt: "2026-09-19T13:30:00+07:00",
        reviewResult: "pending",
        reviewComment: null,
        reviewedAt: null,
      },
    ],
  },
  {
    id: "fs-003",
    title: "Flash Sale ต้อนรับสิ้นเดือน สมัครแพ็กเกจเรียนไม่อั้น 1 ปี",
    brand: "FutureSkill",
    channel: "Facebook",
    scheduledDate: "2026-09-28",
    authorName: "กานต์รวี วงศ์สวัสดิ์",
    imageUrl: "https://drive.google.com/drive/folders/example-fs-003",
    status: "changes_requested",
    pendingDraftText:
      "🎉 Flash Sale ต้อนรับสิ้นเดือน! สมัครแพ็กเกจเรียนไม่อั้น 1 ปี วันนี้ แถมฟรีคอร์ส Soft Skills มูลค่า 1,990 บาท\n\nจำนวนจำกัดเฉพาะ 30 ท่านแรกเท่านั้น รีบสมัครก่อนหมดสิทธิ์ที่ลิงก์ในคอมเมนต์\n\n#FutureSkill #FlashSale",
    createdAt: "2026-09-17T17:45:00+07:00",
    updatedAt: "2026-09-18T09:10:00+07:00",
    versions: [
      {
        versionNumber: 1,
        text:
          "Flash Sale ต้อนรับสิ้นเดือน สมัครแพ็กเกจเรียนไม่อั้น 1 ปี แถมฟรีคอร์ส Soft Skills มูลค่า 1,990 บาท จำนวนจำกัด",
        submittedAt: "2026-09-16T11:00:00+07:00",
        reviewResult: "changes_requested",
        reviewComment:
          "ช่วยใส่จำนวนสิทธิ์ให้ชัดเจนว่าจำกัดกี่ท่าน และเพิ่มความเร่งด่วนหน่อยครับ ตอนนี้ยังรู้สึกเฉย ๆ",
        reviewedAt: "2026-09-17T09:30:00+07:00",
      },
      {
        versionNumber: 2,
        text:
          "🎉 Flash Sale ต้อนรับสิ้นเดือน! สมัครแพ็กเกจเรียนไม่อั้น 1 ปี วันนี้ แถมฟรีคอร์ส Soft Skills มูลค่า 1,990 บาท\n\nจำนวนจำกัดเฉพาะ 30 ท่านแรกเท่านั้น รีบสมัครก่อนหมดสิทธิ์ที่ลิงก์ในคอมเมนต์\n\n#FutureSkill #FlashSale",
        submittedAt: "2026-09-17T17:45:00+07:00",
        reviewResult: "changes_requested",
        reviewComment:
          "ตัวเลขเป้าหมายราคาแพ็กเกจหายไปครับ ช่วยใส่ราคากลับเข้าไปในโพสต์ด้วย ไม่งั้นคนอ่านจะไม่รู้ว่าลดเท่าไหร่",
        reviewedAt: "2026-09-18T09:10:00+07:00",
      },
    ],
  },
  {
    id: "sp-004",
    title: "Quote สร้างแรงบันดาลใจ: 'การเรียนรู้ไม่มีคำว่าสายเกินไป'",
    brand: "SkillPass",
    channel: "Facebook",
    scheduledDate: null,
    authorName: "ศิริพร นาคดี",
    imageUrl: null,
    status: "draft",
    pendingDraftText:
      "\"การเรียนรู้ไม่มีคำว่าสายเกินไป\" ✨\nเริ่มต้นวันจันทร์นี้ด้วยพลังบวก แล้วมาเรียนรู้ทักษะใหม่ ๆ ไปด้วยกันกับ SkillPass\n\n#SkillPass #MondayMotivation",
    createdAt: "2026-09-18T15:30:00+07:00",
    updatedAt: "2026-09-18T15:30:00+07:00",
    versions: [],
  },
  {
    id: "fs-005",
    title: "สัมภาษณ์ศิษย์เก่า: จากนักศึกษาจบใหม่สู่ Data Analyst บริษัทชั้นนำ",
    brand: "FutureSkill",
    channel: "Facebook",
    scheduledDate: "2026-09-20",
    authorName: "กานต์รวี วงศ์สวัสดิ์",
    imageUrl: "https://drive.google.com/drive/folders/example-fs-005",
    status: "approved",
    pendingDraftText:
      "เปิดใจ คุณภูมิ ศิษย์เก่า FutureSkill ที่พิสูจน์แล้วว่าการเปลี่ยนสายงานไม่ใช่เรื่องไกลตัว แบ่งปันมุมมองการจัดตารางชีวิตและเทคนิคการตอบสัมภาษณ์ทางเทคนิค\n\n#FutureSkill #SuccessStory",
    createdAt: "2026-09-16T10:00:00+07:00",
    updatedAt: "2026-09-17T16:40:00+07:00",
    versions: [
      {
        versionNumber: 1,
        text:
          "เปิดใจ คุณภูมิ ศิษย์เก่า FutureSkill ที่พิสูจน์แล้วว่าการเปลี่ยนสายงานไม่ใช่เรื่องไกลตัว แบ่งปันมุมมองการจัดตารางชีวิตและเทคนิคการตอบสัมภาษณ์ทางเทคนิค\n\n#FutureSkill #SuccessStory",
        submittedAt: "2026-09-16T10:00:00+07:00",
        reviewResult: "approved",
        reviewComment: null,
        reviewedAt: "2026-09-17T16:40:00+07:00",
      },
    ],
  },
  {
    id: "fs-006",
    title: "Infographic: สรุปภาพรวมตลาดแรงงานไอทีไตรมาส 4",
    brand: "FutureSkill",
    channel: "Facebook",
    scheduledDate: "2026-09-10",
    authorName: "กานต์รวี วงศ์สวัสดิ์",
    imageUrl: "https://drive.google.com/drive/folders/example-fs-006",
    status: "published",
    pendingDraftText:
      "สำรวจเทรนด์ทักษะแห่งปี 2026 เจาะลึกทักษะสาย Data, AI Engineer และ Cloud Security พร้อมเงินเดือนเฉลี่ยเริ่มต้นสำหรับผู้เริ่มต้นฝึกฝน\n\n#FutureSkill #JobMarket",
    createdAt: "2026-09-05T09:00:00+07:00",
    updatedAt: "2026-09-10T18:00:00+07:00",
    versions: [
      {
        versionNumber: 1,
        text:
          "สำรวจเทรนด์ทักษะแห่งปี 2026 เจาะลึกทักษะสาย Data, AI Engineer และ Cloud Security พร้อมเงินเดือนเฉลี่ยเริ่มต้นสำหรับผู้เริ่มต้นฝึกฝน\n\n#FutureSkill #JobMarket",
        submittedAt: "2026-09-05T09:00:00+07:00",
        reviewResult: "approved",
        reviewComment: null,
        reviewedAt: "2026-09-06T11:20:00+07:00",
      },
    ],
  },
];

export function getAllCaptions(): Caption[] {
  return [...MOCK_CAPTIONS].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getPendingReviewCaptions(): Caption[] {
  return getAllCaptions().filter((c) => c.status === "pending_review");
}

export function getArchivedCaptions(): Caption[] {
  return getAllCaptions().filter(
    (c) => c.status === "approved" || c.status === "published"
  );
}

export function getCaptionById(id: string): Caption | undefined {
  return MOCK_CAPTIONS.find((c) => c.id === id);
}

/** เวอร์ชันล่าสุดที่ "ส่งตรวจแล้ว" ของชิ้นงาน (ไม่ใช่ข้อความแก้ค้างไว้) */
export function getLatestSubmittedVersion(caption: Caption) {
  return caption.versions[caption.versions.length - 1] ?? null;
}

/** เช็คว่าชิ้นงานนี้มีข้อความแก้ค้างที่ยังไม่ได้ส่งตรวจอยู่หรือไม่ */
export function hasUnsentEdit(caption: Caption): boolean {
  const latest = getLatestSubmittedVersion(caption);
  const latestText = latest?.text ?? "";
  return caption.pendingDraftText.trim() !== latestText.trim();
}
