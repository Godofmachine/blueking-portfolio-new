export type CsvRowObject = Record<string, string>;

function stripBom(value: string): string {
  return value.charCodeAt(0) === 0xfeff ? value.slice(1) : value;
}

export function normalizeCsvHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

// Minimal CSV parser that supports:
// - commas
// - quoted fields with escaped quotes ("")
// - newlines inside quoted fields
export function parseCsv(text: string): string[][] {
  const input = stripBom(String(text ?? ""));
  const rows: string[][] = [];

  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  function pushField() {
    row.push(field);
    field = "";
  }

  function pushRow() {
    // Avoid returning a single empty trailing row.
    if (row.length === 1 && row[0] === "") return;
    rows.push(row);
    row = [];
  }

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];

    if (ch === "\r") continue;

    if (ch === '"') {
      if (inQuotes && input[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && ch === ",") {
      pushField();
      continue;
    }

    if (!inQuotes && ch === "\n") {
      pushField();
      pushRow();
      continue;
    }

    field += ch;
  }

  // Flush last field/row.
  pushField();
  if (row.length > 1 || row[0] !== "") pushRow();

  return rows;
}

export function csvToObjects(text: string): { headers: string[]; rows: CsvRowObject[] } {
  const table = parseCsv(text).map((r) => r.map((c) => String(c ?? "")));
  if (table.length === 0) return { headers: [], rows: [] };

  const rawHeaders = table[0];
  const headers = rawHeaders.map(normalizeCsvHeader);

  const rows: CsvRowObject[] = [];
  for (let i = 1; i < table.length; i += 1) {
    const line = table[i];
    const obj: CsvRowObject = {};
    for (let j = 0; j < headers.length; j += 1) {
      const key = headers[j];
      if (!key) continue;
      obj[key] = String(line[j] ?? "").trim();
    }

    // Skip completely empty lines.
    const hasAny = Object.values(obj).some((v) => String(v ?? "").trim());
    if (!hasAny) continue;

    rows.push(obj);
  }

  return { headers, rows };
}

export function pickField(row: CsvRowObject, keys: string[]): string {
  for (const k of keys) {
    const nk = normalizeCsvHeader(k);
    if (nk in row && String(row[nk] ?? "").trim()) return String(row[nk]).trim();
  }
  return "";
}

export function splitList(value: string): string[] {
  const v = String(value ?? "").trim();
  if (!v) return [];

  // Prefer explicit separators; otherwise allow commas.
  const hasExplicit = /[;|]/.test(v);
  const parts = hasExplicit ? v.split(/[;|]/g) : v.split(/,/g);

  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 50);
}

export function slugifyForCsv(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
