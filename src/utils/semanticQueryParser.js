// Vietnamese Semantic Query Parser
// Parses natural language like: "việc làm React lương > 15tr ở HN"
// to structured filters: { keyword, level, location, salaryMin, salaryMax }
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
  if (u.includes("m")) return n * 1_000_000; // common shorthand for million
  if (u.includes("tr") || u.includes("trieu") || u.includes("triệu")) return n * 1_000_000;
  if (u.includes("vnd") || u.includes("d") || u.includes("đ")) return n; // already VND
  // default assume million when unit omitted in VN job context
  return n * 1_000_000;
};

// Known location aliases mapped to code values used by backend
const LOCATION_ALIAS = {
  HANOI: ["hn", "ha noi", "hanoi", "ha-noi", "hà nội"],
  HOCHIMINH: [
    "hcm",
    "tp hcm",
    "tp.hcm",
    "hcmc",
    "ho chi minh",
    "ho-chi-minh",
    "sai gon",
    "saigon",
    "sg",
    "sài gòn",
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
  // 1) Try matching by official labels from LOCATION_LIST (accent-insensitive)
  if (Array.isArray(LOCATION_LIST)) {
    for (const loc of LOCATION_LIST) {
      const code = String(loc.value || "");
      if (!code || code === "ALL" || code === "OTHER") continue;
      const labelNorm = removeAccents(String(loc.label || "")).toLowerCase();
      if (!labelNorm) continue;
      if (normText.includes(labelNorm)) return code;
    }
  }
  // 2) Fallback aliases for common abbreviations
  for (const [code, aliases] of Object.entries(LOCATION_ALIAS)) {
    for (const a of aliases) {
      // word-boundary to reduce false positives
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
  // Common range: "tu 10tr den 20tr", "10-20tr"
  const range1 = norm.match(/tu\s*(\d+[\.,]?\d*)\s*(tr|trieu|m|k|nghin|\u0111|d|vnd)?\s*(den|->|\-|to)\s*(\d+[\.,]?\d*)\s*(tr|trieu|m|k|nghin|\u0111|d|vnd)?/);
  if (range1) {
    const min = toVND(range1[1].replace(/\./g, ""), range1[2]);
    const max = toVND(range1[4].replace(/\./g, ""), range1[5] || range1[2]);
    return { salaryMin: min, salaryMax: max };
  }
  const range2 = norm.match(/(\d+[\.,]?\d*)\s*(tr|trieu|m|k)\s*\-\s*(\d+[\.,]?\d*)\s*(tr|trieu|m|k)/);
  if (range2) {
    const min = toVND(range2[1].replace(/\./g, ""), range2[2]);
    const max = toVND(range2[3].replace(/\./g, ""), range2[4]);
    return { salaryMin: min, salaryMax: max };
  }

  // Comparators around "luong": ">= 15tr", "> 15tr", "<= 20tr", "< 20tr"
  const comp = norm.match(/luong[^\d<>]*([<>]=?)\s*(\d+[\.,]?\d*)\s*(tr|trieu|m|k|nghin|\u0111|d|vnd)?/);
  if (comp) {
    const val = toVND(comp[2].replace(/\./g, ""), comp[3]);
    if (comp[1].includes(">")) return { salaryMin: val };
    if (comp[1].includes("<")) return { salaryMax: val };
  }

  // Fallback: presence of "luong" + a number+unit => assume salaryMin
  const any = norm.match(/luong[^\d]*(\d+[\.,]?\d*)\s*(tr|trieu|m|k|nghin|\u0111|d|vnd)?/);
  if (any) {
    const val = toVND(any[1].replace(/\./g, ""), any[2]);
    return { salaryMin: val };
  }

  return { salaryMin: null, salaryMax: null };
};

// Extract keyword candidates (techs/domains) from text
const extractKeywords = (text) => {
  const techs = [
    // Tech stack
    "react", "node", "java", "python", "golang", "vue", "angular",
    "ios", "android", "devops", "tester", "qa", "data", "backend",
    "frontend", "flutter", "c#", "c++", "dotnet", "spring", "django",
    "php", "laravel", "ruby", "rails", "kotlin", "swift", "typescript",
    // Non-tech professions (VN & EN variants)
    "marketing", "sale", "sales", "seo", "sem", "social", "pr",
    "ke toan", "accounting", "nhan su", "hr", "human resources",
    "customer service", "cs", "content", "copywriter",
    "designer", "graphic", "ui", "ux", "ui/ux",
    "product", "project", "business analyst", "ba",
  ];
  const lowerNorm = removeAccents(String(text || "").toLowerCase());
  const found = techs.filter(t => lowerNorm.includes(t));
  // Chỉ trả về khi khớp nghề/công nghệ; nếu không, để trống để tránh "lam", "viec"...
  if (found.length > 0) return found[0];
  return "";
};

export const parseSemanticQuery = (input = "") => {
  const text = (input || "").trim();
  const norm = removeAccents(text.toLowerCase());

  const { salaryMin, salaryMax } = extractSalary(text);
  const location = extractLocation(norm);
  const level = extractLevel(norm);
  const keyword = extractKeywords(text);
  const companyName = extractCompanyName(text);

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

// --- Company name extraction ---
// Supports patterns:
//  - "@Viettel" (leading @)
//  - "company: FPT", "công ty: VNG", "cty: ABC"
// Keeps simple to avoid false positives; prefer explicit tokens.
function extractCompanyName(text = "") {
  const t = String(text || "");
  // @Company pattern
  const at = t.match(/@([\w\p{L}][^\s,;]+)/u);
  if (at) return at[1].trim();
  // company: name patterns
  const colon = t.match(/\b(company|công ty|cty)\s*:\s*([^,;\n]+)/i);
  if (colon) return (colon[2] || "").trim();
  return "";
}