export const buildSkillKey = (skillName, category) =>
  `${(skillName || "").trim().toLowerCase()}|${(category || "general").trim().toLowerCase()}`;

export const normalizeSkillLookup = (value) =>
  (value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");

export const normalizeCategoryLookup = (value) => {
  const normalized = (value || "").trim().toLowerCase();
  return (normalized || "general").replace(/[^a-z0-9]+/g, "");
};

export const toSafeHttpUrl = (value) => {
  try {
    const parsed = new URL(String(value || "").trim());
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return "";
  } catch {
    return "";
  }
};

export const findCatalogSkillMatch = (catalogSkills, skillName, category) => {
  const skills = Array.isArray(catalogSkills) ? catalogSkills : [];
  const exactKey = buildSkillKey(skillName, category);

  const exactMatch = skills.find((item) => buildSkillKey(item?.skillName, item?.category) === exactKey);
  if (exactMatch) {
    return exactMatch;
  }

  const normalizedName = normalizeSkillLookup(skillName);
  const normalizedCategory = normalizeCategoryLookup(category);

  if (!normalizedName) {
    return null;
  }

  const looseMatches = skills.filter((item) => {
    if (!item?.skillName) return false;
    if (normalizeCategoryLookup(item.category) !== normalizedCategory) return false;

    const candidate = normalizeSkillLookup(item.skillName);
    if (!candidate) return false;

    return (
      candidate === normalizedName ||
      candidate.includes(normalizedName) ||
      normalizedName.includes(candidate)
    );
  });

  if (!looseMatches.length) {
    return null;
  }

  const score = (item) => {
    const candidate = normalizeSkillLookup(item.skillName);
    if (candidate === normalizedName) return 0;

    const lengthGap = Math.abs(candidate.length - normalizedName.length);
    const containment = candidate.includes(normalizedName) || normalizedName.includes(candidate) ? 10 : 50;
    const prefix = candidate.startsWith(normalizedName) || normalizedName.startsWith(candidate) ? -5 : 0;
    return Math.max(0, lengthGap + containment + prefix);
  };

  return looseMatches.sort((a, b) => score(a) - score(b))[0] || null;
};
