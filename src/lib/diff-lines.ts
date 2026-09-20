/**
 * เทียบข้อความเก่ากับใหม่ทีละบรรทัด เพื่อบอกหัวหน้าว่ารอบนี้เปลี่ยนอะไรไปบ้าง
 * เทียบเป็น "บรรทัด" ไม่ใช่ "คำ" เพราะภาษาไทยไม่เว้นวรรคระหว่างคำ การเทียบคำจะมั่ว
 * ส่วนแคปชันมักขึ้นบรรทัดใหม่ทีละประโยคอยู่แล้ว เทียบบรรทัดจึงตรงกับที่คนอ่านเข้าใจ
 */
export type DiffLine = {
  type: "same" | "added" | "removed";
  text: string;
};

/** กันข้อความยาวผิดปกติไม่ให้คำนวณนานเกินไป */
const MAX_CELLS = 4_000_000;

export function diffLines(oldText: string, newText: string): DiffLine[] {
  const a = oldText.replace(/\r\n/g, "\n").split("\n");
  const b = newText.replace(/\r\n/g, "\n").split("\n");
  const m = a.length;
  const n = b.length;

  if (m * n > MAX_CELLS) {
    return b.map((text) => ({ type: "added", text }));
  }

  // dp[i][j] = ความยาวของส่วนที่เหมือนกันที่สุด เมื่อดูจากบรรทัด i ของเก่า และ j ของใหม่
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0)
  );
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] =
        a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      result.push({ type: "same", text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: "removed", text: a[i] });
      i++;
    } else {
      result.push({ type: "added", text: b[j] });
      j++;
    }
  }
  while (i < m) result.push({ type: "removed", text: a[i++] });
  while (j < n) result.push({ type: "added", text: b[j++] });

  return result;
}
