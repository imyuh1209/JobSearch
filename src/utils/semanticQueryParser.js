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
const extractLocation = (normText, originalText) => {
  let matchedText = "";
  let code = "";

  // Helper to find the original casing/spacing from the norm match
  const findOriginalMatch = (labelNorm) => {
    const idx = normText.indexOf(labelNorm);
    if (idx === -1) return "";
    return originalText.substring(idx, idx + labelNorm.length);
  };

  if (Array.isArray(LOCATION_LIST)) {
    // Sort by length descending to match "TP Hồ Chí Minh" before "Hồ Chí Minh"
    const sortedList = [...LOCATION_LIST]
      .filter(l => l.value !== "ALL" && l.value !== "OTHER")
      .sort((a, b) => b.label.length - a.label.length);

    for (const loc of sortedList) {
      const labelNorm = removeAccents(String(loc.label || "")).toLowerCase();
      if (normText.includes(labelNorm)) {
        return { code: loc.value, matchedText: findOriginalMatch(labelNorm) };
      }
    }
  }

  for (const [c, aliases] of Object.entries(LOCATION_ALIAS)) {
    const sortedAliases = [...aliases].sort((a, b) => b.length - a.length);
    for (const a of sortedAliases) {
      const aNorm = removeAccents(a.toLowerCase());
      const idx = normText.indexOf(aNorm);
      if (idx !== -1) {
        return { code: c, matchedText: originalText.substring(idx, idx + aNorm.length) };
      }
    }
  }
  return { code: "", matchedText: "" };
};

// Extract level code from text
const extractLevel = (normText, originalText) => {
  for (const [code, aliases] of Object.entries(LEVEL_ALIAS)) {
    for (const a of aliases) {
      const aNorm = removeAccents(a.toLowerCase());
      const idx = normText.indexOf(aNorm);
      if (idx !== -1) {
        return { code, matchedText: originalText.substring(idx, idx + aNorm.length) };
      }
    }
  }
  return { code: "", matchedText: "" };
};

// Extract salary comparators and range
const extractSalary = (text) => {
  // Improved extraction logic with matchedText
  const r1 = text.match(/(?:từ|tu)\s*(\d+[.,]?\d*)\s*(?:tr|triệu|trieu|m|k|nghìn|nghin)?\s*(?:đến|den|->|-|to)\s*(\d+[.,]?\d*)\s*(?:tr|triệu|trieu|m|k|nghìn|nghin)?/i);
  if (r1) return { salaryMin: toVND(r1[1]), salaryMax: toVND(r1[2]), matchedText: r1[0] };

  const r2 = text.match(/(\d+[.,]?\d*)\s*(?:tr|triệu|trieu|m|k)\s*-\s*(\d+[.,]?\d*)\s*(?:tr|triệu|trieu|m|k)/i);
  if (r2) return { salaryMin: toVND(r2[1]), salaryMax: toVND(r2[2]), matchedText: r2[0] };

  const r3 = text.match(/(?:lương|luong|thu nhập|thu nhap)?\s*([<>]=?)\s*(\d+[.,]?\d*)\s*(?:tr|triệu|trieu|m|k|nghìn|nghin|d|vnd)?/i);
  if (r3) {
    const val = toVND(r3[2]);
    return { 
      salaryMin: r3[1].includes(">") ? val : null, 
      salaryMax: r3[1].includes("<") ? val : null, 
      matchedText: r3[0] 
    };
  }

  const r4 = text.match(/(?:lương|luong|thu nhập|thu nhap)\s*(\d+[.,]?\d*)\s*(?:tr|triệu|trieu|m|k|nghìn|nghin|d|vnd)?/i);
  if (r4) return { salaryMin: toVND(r4[1]), matchedText: r4[0] };

  return { salaryMin: null, salaryMax: null, matchedText: "" };
};

// Extract company name by explicit markers (@Company or "công ty: Name")
function extractCompanyName(text = "") {
  const t = String(text || "");
  const at = t.match(/@([\w\p{L}][^\s,;]+)/u);
  if (at) return { name: at[1].trim(), matchedText: at[0] };
  const colon = t.match(/\b(company|cong ty|cty)\s*:\s*([^,;\n]+)/i);
  if (colon) return { name: (colon[2] || "").trim(), matchedText: colon[0] };
  return { name: "", matchedText: "" };
}

export const parseSemanticQuery = (input = "") => {
  let text = (input || "").trim();

  const salary = extractSalary(text);
  const loc = extractLocation(removeAccents(text.toLowerCase()), text);
  const lvl = extractLevel(removeAccents(text.toLowerCase()), text);
  const comp = extractCompanyName(text);

  // Strip exactly what was found
  let keyword = text;
  if (salary.matchedText) keyword = keyword.replace(salary.matchedText, " ");
  if (loc.matchedText) {
      // Find "at/in" markers near the location and strip them too
      const pattern = new RegExp(`(?:ở|tại|o |tai )\\s*${loc.matchedText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "gi");
      if (pattern.test(keyword)) {
          keyword = keyword.replace(pattern, " ");
      } else {
          keyword = keyword.replace(loc.matchedText, " ");
      }
  }
  if (lvl.matchedText) keyword = keyword.replace(lvl.matchedText, " ");
  if (comp.matchedText) keyword = keyword.replace(comp.matchedText, " ");

  // Final cleanup of stop words and whitespace
  const stopWords = ["việc làm", "viec lam", "tìm kiếm", "tim kiem", "cần tìm", "can tim", "tuyển", "tuyen"];
  stopWords.forEach(w => {
    keyword = keyword.replace(new RegExp(`\\b${w}\\b`, "gi"), " ");
  });

  keyword = keyword.replace(/[,;]+/g, " ").replace(/\s+/g, " ").trim();

  return {
    keyword,
    level: lvl.code,
    location: loc.code,
    salaryMin: salary.salaryMin ?? null,
    salaryMax: salary.salaryMax ?? null,
    companyName: comp.name,
  };
};

export default parseSemanticQuery;