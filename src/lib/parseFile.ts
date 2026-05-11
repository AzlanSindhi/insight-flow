// Client-side dataset profiling: schema + sample + summary so the AI can ground answers.

export interface ColumnSchema {
  name: string;
  type: "number" | "string" | "boolean" | "date" | "mixed" | "empty";
  nulls: number;
  unique: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
  examples: (string | number | boolean | null)[];
}

export interface ParsedFile {
  rowCount: number;
  columnCount: number;
  fileType: string;
  healthScore: number;
  summary: string;
  schema: ColumnSchema[];
  sample: Record<string, unknown>[]; // first ~50 rows
}

const SAMPLE_ROWS = 50;
const MAX_SCAN_ROWS = 5000;

function detectType(v: unknown): ColumnSchema["type"] {
  if (v === null || v === undefined || v === "") return "empty";
  if (typeof v === "boolean") return "boolean";
  if (typeof v === "number" && !isNaN(v)) return "number";
  const s = String(v).trim();
  if (/^-?\d+(\.\d+)?$/.test(s)) return "number";
  if (/^(true|false)$/i.test(s)) return "boolean";
  if (!isNaN(Date.parse(s)) && /[-/:]/.test(s)) return "date";
  return "string";
}

function profileRows(rows: Record<string, unknown>[], headers: string[]): ColumnSchema[] {
  return headers.map((h) => {
    const seen = new Set<string>();
    const types = new Map<string, number>();
    let nulls = 0;
    let numSum = 0;
    let numCount = 0;
    let numMin = Infinity;
    let numMax = -Infinity;
    const examples: any[] = [];
    for (const r of rows) {
      const v = r[h];
      if (v === null || v === undefined || v === "") { nulls++; continue; }
      const t = detectType(v);
      types.set(t, (types.get(t) || 0) + 1);
      const key = String(v);
      if (seen.size < 1000) seen.add(key);
      if (examples.length < 5 && !examples.includes(v as any)) examples.push(v as any);
      if (t === "number") {
        const n = Number(v);
        if (!isNaN(n)) { numSum += n; numCount++; if (n < numMin) numMin = n; if (n > numMax) numMax = n; }
      }
    }
    let resolved: ColumnSchema["type"] = "empty";
    let topCount = 0;
    for (const [t, c] of types) if (c > topCount) { topCount = c; resolved = t; }
    if (types.size > 1) {
      const total = Array.from(types.values()).reduce((a, b) => a + b, 0);
      if (topCount / total < 0.85) resolved = "mixed";
    }
    const col: ColumnSchema = { name: h, type: resolved, nulls, unique: seen.size, examples };
    if (numCount > 0) {
      col.min = numMin; col.max = numMax; col.mean = +(numSum / numCount).toFixed(3);
    }
    return col;
  });
}

function parseCsvLine(line: string): string[] {
  const out: string[] = []; let cur = ""; let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else {
      if (c === '"') q = true;
      else if (c === ",") { out.push(cur); cur = ""; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}

export async function parseFile(file: File): Promise<ParsedFile> {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  let rows: Record<string, unknown>[] = [];
  let headers: string[] = [];
  let totalRows = 0;
  let summary = "";

  try {
    if (ext === "csv") {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
      headers = lines[0] ? parseCsvLine(lines[0]).map((h) => h.trim()) : [];
      const dataLines = lines.slice(1).slice(0, MAX_SCAN_ROWS);
      rows = dataLines.map((l) => {
        const cells = parseCsvLine(l);
        const row: Record<string, unknown> = {};
        headers.forEach((h, i) => { row[h] = cells[i] ?? ""; });
        return row;
      });
      totalRows = lines.length - 1;
      summary = `CSV with ${totalRows.toLocaleString()} rows × ${headers.length} columns.`;
    } else if (ext === "json") {
      const text = await file.text();
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        const head = data.slice(0, MAX_SCAN_ROWS);
        const keySet = new Set<string>();
        for (const r of head) if (r && typeof r === "object") Object.keys(r).forEach((k) => keySet.add(k));
        headers = Array.from(keySet);
        rows = head.map((r: any) => {
          const row: Record<string, unknown> = {};
          headers.forEach((h) => (row[h] = r?.[h] ?? null));
          return row;
        });
        totalRows = data.length;
      } else if (data && typeof data === "object") {
        headers = Object.keys(data);
        rows = [data as Record<string, unknown>];
        totalRows = 1;
      }
      summary = `JSON dataset with ${totalRows.toLocaleString()} records × ${headers.length} fields.`;
    } else {
      // xlsx, xls, xml — size-based estimate, no sample
      totalRows = Math.max(10, Math.floor(file.size / 80));
      headers = [];
      summary = `${ext.toUpperCase()} file (${(file.size / 1024).toFixed(1)} KB) ingested. Sample-level inspection requires CSV or JSON.`;
    }
  } catch (e: any) {
    summary = `Could not auto-parse: ${e?.message || "unknown error"}.`;
  }

  const schema = headers.length ? profileRows(rows, headers) : [];
  const sample = rows.slice(0, SAMPLE_ROWS);

  // Health score: fewer nulls + parseable structure → higher score
  let health = 60;
  if (headers.length > 0 && totalRows > 0) {
    const nullRate =
      schema.reduce((a, c) => a + c.nulls, 0) / Math.max(1, schema.length * Math.min(rows.length, MAX_SCAN_ROWS));
    health = Math.round(95 - nullRate * 60);
    health = Math.max(40, Math.min(99, health));
  }

  return {
    rowCount: totalRows,
    columnCount: headers.length,
    fileType: ext,
    healthScore: health,
    summary,
    schema,
    sample,
  };
}
