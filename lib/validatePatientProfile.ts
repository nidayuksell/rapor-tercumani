import type {
  AgeRange,
  FastingStatus,
  Gender,
  PatientProfile,
  PregnancyStatus,
  ReportType,
} from "./types";

const AGE_VALUES = new Set(["0-17", "18-35", "36-55", "55+"]);
const GENDER_VALUES = new Set<Gender>(["kadin", "erkek"]);
const PREGNANCY_VALUES = new Set<PregnancyStatus>(["gebe-degil", "gebe"]);
const FASTING_VALUES = new Set<FastingStatus>(["ac", "tok", "bilinmiyor"]);

/** Sunucu: istek gövdesinden güvenli PatientProfile üret veya null */
export function parsePatientProfile(
  raw: unknown,
  reportType: ReportType,
): PatientProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const ageRange = o.ageRange;
  const gender = o.gender;
  if (typeof ageRange !== "string" || !AGE_VALUES.has(ageRange)) return null;
  if (typeof gender !== "string" || !GENDER_VALUES.has(gender as Gender)) return null;

  let pregnancy: PregnancyStatus | null = null;
  if (gender === "kadin") {
    const pr = o.pregnancy;
    if (typeof pr !== "string" || !PREGNANCY_VALUES.has(pr as PregnancyStatus)) return null;
    pregnancy = pr as PregnancyStatus;
  }

  let fasting: FastingStatus | null = null;
  if (reportType === "kan") {
    const f = o.fasting;
    if (typeof f !== "string" || !FASTING_VALUES.has(f as FastingStatus)) return null;
    fasting = f as FastingStatus;
  }

  const chronic =
    typeof o.chronicConditions === "string" ? o.chronicConditions : "";

  return {
    ageRange: ageRange as AgeRange,
    gender: gender as Gender,
    pregnancy,
    fasting,
    chronicConditions: chronic,
  };
}

export function profileForPrompt(p: PatientProfile): PatientProfile {
  return {
    ...p,
    chronicConditions: p.chronicConditions.trim(),
  };
}
