// Vietnamese Semantic Query Parser
// Parses natural language like: "việc làm React lương > 15tr ở HN"
// to structured filters: { keyword, level, location, salaryMin, salaryMax, companyName }
import { LOCATION_LIST } from "../config/utils";

// Remove Vietnamese accents for easier matching
const removeAccents = (str = "") => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

// Convert value+unit to VND number
const toVND = (num, unit) => {
  const n = Number(num);
  if (Number.isNaN(n)) return null;
  const u = (unit || "").toLowerCase();
  if (u.includes("k") || u.includes("nghin") || u.includes("nghìn")) return n * 1_000;
  if (u.includes("m")) return n * 1_000_000;
  if (u.includes("tr") || u.includes("trieu") || u.includes("triệu")) return n * 1_000_000;
  if (u.includes("vnd") || u.includes("d") || u.includes("đ")) return n;
  return n * 1_000_000;
};

// Known location aliases mapped to code values used by backend
const LOCATION_ALIAS = {
  HANOI: ["hn", "ha noi", "hanoi", "ha-noi", "hà nội"],
  HOCHIMINH: [
    "hcm", "tp hcm", "tp.hcm", "hcmc", "ho chi minh",
    "ho-chi-minh", "sai gon", "saigon", "sg", "sài gòn",
  ],
  DANANG: ["dn", "da nang", "danang", "đà nẵng", "da-nang"],
  HAIPHONG: ["hp", "hai phong", "haiphong", "hải phòng"],
  CANTHO: ["ct", "can tho", "cantho", "cần thơ"],
  THUATHIENHUE: ["hue", "thua thien hue", "tt hue", "huế"],
  BINHDUONG: ["binh duong"],
  DONGNAI: ["dong nai", "dongnai"],
};

const LEVEL_ALIAS = {
  INTERN: ["intern", "thuc tap", "thực tập"],
  FRESHER: ["fresher"],
  JUNIOR: ["junior"],
  MIDDLE: ["middle", "mid"],
  SENIOR: ["senior", "sr"],
};

// Extract location value code from text
const extractLocation = (normText) => {
  if (Array.isArray(LOCATION_LIST)) {
    for (const loc of LOCATION_LIST) {
      const code = String(loc.value || "");
      if (!code || code === "ALL" || code === "OTHER") continue;
      const labelNorm = removeAccents(String(loc.label || "")).toLowerCase();
      if (!labelNorm) continue;
      if (normText.includes(labelNorm)) return code;
    }
  }
  for (const [code, aliases] of Object.entries(LOCATION_ALIAS)) {
    for (const a of aliases) {
      const re = new RegExp(`(^|[^a-z])${a}([^a-z]|$)`);
      if (re.test(normText)) return code;
    }
  }
  return "";
};

// Extract level code from text
const extractLevel = (normText) => {
  for (const [code, aliases] of Object.entries(LEVEL_ALIAS)) {
    for (const a of aliases) {
      if (normText.includes(a)) return code;
    }
  }
  return "";
};

// Extract salary comparators and range
const extractSalary = (text) => {
  const norm = removeAccents(text.toLowerCase());

  // Range: "tu 10tr den 20tr", "10-20tr"
  const range1 = norm.match(
    /tu\s*(\d+[.,]?\d*)\s*(tr|trieu|m|k|nghin|d|vnd)?\s*(den|->|-|to)\s*(\d+[.,]?\d*)\s*(tr|trieu|m|k|nghin|d|vnd)?/
  );
  if (range1) {
    const min = toVND(range1[1].replace(/\./g, ""), range1[2]);
    const max = toVND(range1[4].replace(/\./g, ""), range1[5] || range1[2]);
    return { salaryMin: min, salaryMax: max };
  }

  const range2 = norm.match(
    /(\d+[.,]?\d*)\s*(tr|trieu|m|k)\s*-\s*(\d+[.,]?\d*)\s*(tr|trieu|m|k)/
  );
  if (range2) {
    const min = toVND(range2[1].replace(/\./g, ""), range2[2]);
    const max = toVND(range2[3].replace(/\./g, ""), range2[4]);
    return { salaryMin: min, salaryMax: max };
  }

  // Comparators: "> 15tr", ">= 20tr"
  const comp = norm.match(
    /luong[^\d<>]*([<>]=?)\s*(\d+[.,]?\d*)\s*(tr|trieu|m|k|nghin|d|vnd)?/
  );
  if (comp) {
    const val = toVND(comp[2].replace(/\./g, ""), comp[3]);
    if (comp[1].includes(">")) return { salaryMin: val };
    if (comp[1].includes("<")) return { salaryMax: val };
  }

  // Fallback: "luong 15tr" => salaryMin
  const any = norm.match(
    /luong[^\d]*(\d+[.,]?\d*)\s*(tr|trieu|m|k|nghin|d|vnd)?/
  );
  if (any) {
    const val = toVND(any[1].replace(/\./g, ""), any[2]);
    return { salaryMin: val };
  }

  return { salaryMin: null, salaryMax: null };
};

// Extract company name by explicit markers (@Company or "công ty: Name")
function extractCompanyName(text = "") {
  const t = String(text || "");
  // @CompanyName pattern
  const at = t.match(/@([\w\p{L}][^\s,;]+)/u);
  if (at) return at[1].trim();
  // "công ty: CompanyName" pattern
  const colon = t.match(/\b(company|cong ty|cty)\s*:\s*([^,;\n]+)/i);
  if (colon) return (colon[2] || "").trim();
  return "";
}

/**
 * Strip known semantic tokens from the input text and return the remainder,
 * which will be used as the free-text job-name / keyword.
 *
 * Strategy: strip strings that were already parsed as location, level, salary,
 * company. Whatever remains is the job-title or skill-name the user typed.
 */
const stripKnownTokens = (text, { location, level, companyName }) => {
  let t = text;

  // 1. Strip salary expressions (lương X tr, tu X den Y, ...)
  t = t.replace(
    /(?:lương|luong|thu nhập|thu nhap)\s*[><=]?\s*\d+[.,]?\d*\s*(?:tr|triệu|trieu|m|k|nghìn|nghin)?/gi,
    " "
  );
  t = t.replace(
    /từ\s*\d+[.,]?\d*\s*(?:tr|triệu|trieu|m|k)?\s*(?:đến|den|-|to)\s*\d+[.,]?\d*\s*(?:tr|triệu|trieu|m|k)?/gi,
    " "
  );
  t = t.replace(
    /\d+[.,]?\d*\s*(?:tr|triệu|trieu|m|k)\s*-\s*\d+[.,]?\d*\s*(?:tr|triệu|trieu|m|k)/gi,
    " "
  );

  // 2. Strip location expressions: "ở HN", "tại Hà Nội", "tại hcm"
  t = t.replace(/(?:ở|tại|o |tai )\s*[^\s,;]+(?:\s+[^\s,;]+)?/gi, " ");

  // 3. Strip level keywords
  Object.values(LEVEL_ALIAS).flat().forEach((a) => {
    t = t.replace(new RegExp(`\\b${a}\\b`, "gi"), " ");
  });

  // 4. Strip explicit company markers (@Co, "công ty: X")
  t = t.replace(/@[\w\p{L}][^\s,;]+/gu, " ");
  t = t.replace(/\b(?:company|cong ty|cty)\s*:\s*[^,;\n]+/gi, " ");
  if (companyName) {
    t = t.replace(new RegExp(companyName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), " ");
  }

  // 5. Strip generic filler tokens
  const stopWords = [
    "việc làm", "viec lam", "tìm kiếm", "tim kiem", "cần tìm", "can tim",
    "tuyển", "tuyen", "xin việc", "xin viec",
  ];
  stopWords.forEach((w) => {
    t = t.replace(new RegExp(w, "gi"), " ");
  });

  return t.replace(/\s+/g, " ").trim();
};

export const parseSemanticQuery = (input = "") => {
  const text = (input || "").trim();
  const norm = removeAccents(text.toLowerCase());

  const { salaryMin, salaryMax } = extractSalary(text);
  const location = extractLocation(norm);
  const level = extractLevel(norm);
  const companyName = extractCompanyName(text);

  // Strip all known tokens → what remains is the job-name / keyword
  const remaining = stripKnownTokens(text, { location, level, companyName });
  const keyword = remaining.replace(/[,;]+/g, " ").replace(/\s+/g, " ").trim();

  return {
    keyword,
    level,
    location,
    salaryMin: salaryMin ?? null,
    salaryMax: salaryMax ?? null,
    companyName,
  };
};

export default parseSemanticQuery;