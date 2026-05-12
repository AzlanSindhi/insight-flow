// Client-side dataset profiling: schema + sample + summary so the AI can ground answers.
import * as XLSX from "xlsx";

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
  sample: Record<string, unknown>[];
  domain: string; // heuristic guess: ecommerce, finance, healthcare, ...
}

const SAMPLE_ROWS = 50;
const MAX_SCAN_ROWS = 5000;

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  ecommerce: ["order", "product", "sku", "cart", "checkout", "shipping", "discount", "customer_id", "price"],
  finance: ["amount", "balance", "transaction", "account", "credit", "debit", "interest", "currency", "ledger"],
  healthcare: ["patient", "diagnosis", "icd", "treatment", "doctor", "prescription", "hospital", "symptom"],
  marketing: ["campaign", "impression", "click", "ctr", "conversion", "channel", "source", "utm"],
  sales: ["lead", "deal", "pipeline", "quota", "revenue", "opportunity", "stage", "rep"],
  hr: ["employee", "salary", "department", "hire_date", "manager", "tenure", "performance"],
  movies: ["movie", "title", "genre", "director", "actor", "rating", "imdb", "box_office", "budget"],
  social: ["post", "like", "follower", "tweet", "engagement", "hashtag", "share"],
  iot: ["sensor", "device", "timestamp", "reading", "temperature", "humidity"],
  education: ["student", "grade", "course", "teacher", "school", "score", "exam"],
  realestate: ["property", "listing", "price", "bedrooms", "bathrooms", "sqft", "zip"],
};

function detectDomain(headers: string[]): string {
  const lc = headers.map((h) => h.toLowerCase());
  let best = "general";
  let bestScore = 0;
  for (const [dom, kws] of Object.entries(DOMAIN_KEYWORDS)) {
    const score = kws.reduce((a, k) => a + (lc.some((h) => h.includes(k)) ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; best = dom; }
  }
  return bestScore >= 2 ? best : "general";
}

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
    let nulls = 0, numSum = 0, numCount = 0, numMin = Infinity, numMax = -Infinity;
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
    for (const [t, c] of types) if (c > topCount) { topCount = c; resolved = t as ColumnSchema["type"]; }
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

function parseSqlInserts(text: string): { headers: string[]; rows: Record<string, unknown>[]; total: number } {
  // Very simple INSERT INTO t (a,b) VALUES (..),(..); parser
  const headers: string[] = [];
  const rows: Record<string, unknown>[] = [];
  const re = /INSERT\s+INTO\s+[`"\[]?(\w+)[`"\]]?\s*\(([^)]+)\)\s*VALUES\s*([\s\S]+?);/gi;
  let m: RegExpExecArray | null;
  let total = 0;
  while ((m = re.exec(text)) && rows.length < MAX_SCAN_ROWS) {
    const cols = m[2].split(",").map((s) => s.trim().replace(/^[`"\[]|[`"\]]$/g, ""));
    if (!headers.length) headers.push(...cols);
    const valuesPart = m[3];
    const tupleRe = /\(((?:[^()']|'(?:\\.|[^'])*')*)\)/g;
    let t: RegExpExecArray | null;
    while ((t = tupleRe.exec(valuesPart))) {
      total++;
      if (rows.length >= MAX_SCAN_ROWS) continue;
      const raw = t[1];
      const vals: string[] = [];
      let cur = "", inS = false;
      for (let i = 0; i < raw.length; i++) {
        const c = raw[i];
        if (inS) {
          if (c === "\\" && i + 1 < raw.length) { cur += raw[i + 1]; i++; }
          else if (c === "'") inS = false;
          else cur += c;
        } else {
          if (c === "'") inS = true;
          else if (c === ",") { vals.push(cur.trim()); cur = ""; }
          else cur += c;
        }
      }
      vals.push(cur.trim());
      const row: Record<string, unknown> = {};
      cols.forEach((h, i) => { let v: any = vals[i]; if (v === "NULL" || v === undefined) v = null; row[h] = v; });
      rows.push(row);
    }
  }
  return { headers, rows, total };
}

function parseXmlRecords(text: string): { headers: string[]; rows: Record<string, unknown>[]; total: number } {
  // Detect repeating leaf-record element by frequency
  const tagRe = /<(\w+)(\s[^>]*)?>([\s\S]*?)<\/\1>/g;
  const counts = new Map<string, number>();
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(text))) counts.set(m[1], (counts.get(m[1]) || 0) + 1);
  let recordTag = ""; let max = 0;
  for (const [t, c] of counts) if (c > max && c > 1) { max = c; recordTag = t; }
  if (!recordTag) return { headers: [], rows: [], total: 0 };
  const recRe = new RegExp(`<${recordTag}(?:\\s[^>]*)?>([\\s\\S]*?)</${recordTag}>`, "g");
  const headerSet = new Set<string>();
  const rows: Record<string, unknown>[] = [];
  let r: RegExpExecArray | null;
  let total = 0;
  while ((r = recRe.exec(text))) {
    total++;
    if (rows.length >= MAX_SCAN_ROWS) continue;
    const inner = r[1];
    const row: Record<string, unknown> = {};
    const fieldRe = /<(\w+)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g;
    let f: RegExpExecArray | null;
    while ((f = fieldRe.exec(inner))) { headerSet.add(f[1]); row[f[1]] = f[2].trim(); }
    rows.push(row);
  }
  return { headers: Array.from(headerSet), rows, total };
}

export async function parseFile(file: File): Promise<ParsedFile> {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  let rows: Record<string, unknown>[] = [];
  let headers: string[] = [];
  let totalRows = 0;
  let summary = "";

  try {
    if (ext === "csv" || ext === "txt") {
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
      summary = `Tabular file with ${totalRows.toLocaleString()} rows × ${headers.length} columns.`;
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
    } else if (ext === "xlsx" || ext === "xls") {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });
      const head = json.slice(0, MAX_SCAN_ROWS);
      const keySet = new Set<string>();
      for (const r of head) if (r && typeof r === "object") Object.keys(r).forEach((k) => keySet.add(k));
      headers = Array.from(keySet);
      rows = head as Record<string, unknown>[];
      totalRows = json.length;
      summary = `Excel sheet "${wb.SheetNames[0]}" with ${totalRows.toLocaleString()} rows × ${headers.length} columns.`;
    } else if (ext === "xml") {
      const text = await file.text();
      const r = parseXmlRecords(text);
      headers = r.headers; rows = r.rows; totalRows = r.total;
      summary = `XML feed with ${totalRows.toLocaleString()} records × ${headers.length} fields.`;
    } else if (ext === "sql") {
      const text = await file.text();
      const r = parseSqlInserts(text);
      headers = r.headers; rows = r.rows; totalRows = r.total;
      summary = `SQL dump with ${totalRows.toLocaleString()} INSERT rows × ${headers.length} columns.`;
    } else {
      totalRows = Math.max(10, Math.floor(file.size / 80));
      headers = [];
      summary = `${ext.toUpperCase()} file (${(file.size / 1024).toFixed(1)} KB) ingested.`;
    }
  } catch (e: any) {
    summary = `Could not auto-parse: ${e?.message || "unknown error"}.`;
  }

  const schema = headers.length ? profileRows(rows, headers) : [];
  const sample = rows.slice(0, SAMPLE_ROWS);
  const domain = headers.length ? detectDomain(headers) : "general";

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
    domain,
  };
}
