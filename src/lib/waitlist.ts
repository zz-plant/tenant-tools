import { allowedPortfolios } from "../data/submissionOptions";
import type { PortfolioId } from "../data/submissionOptions";
import { sanitizeLimitedText } from "./validation";

const allowedPortfolioSet = new Set<PortfolioId>(allowedPortfolios);
const maxBuildingLength = 140;
const maxCityLength = 60;

const containsUnitInfo = (value: string) =>
  /(?:\bapt\b|\bunit\b|\bsuite\b|\bste\b|#\s*\w+)/i.test(value);

export type WaitlistInput = {
  building: string;
  city?: string;
  portfolio: PortfolioId;
};

const isValidPortfolioId = (value: unknown): value is PortfolioId =>
  typeof value === "string" && allowedPortfolioSet.has(value as PortfolioId);

export const validateWaitlistInput = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return { ok: false, errors: ["Payload must be an object."] } as const;
  }

  const data = payload as Record<string, unknown>;
  const errors: string[] = [];

  const building =
    typeof data.building === "string" ? sanitizeLimitedText(data.building, maxBuildingLength) : "";
  if (!building) {
    errors.push("Building address is required.");
  }
  if (building && containsUnitInfo(building)) {
    errors.push("Do not include unit numbers in the building address.");
  }

  const city = typeof data.city === "string" ? sanitizeLimitedText(data.city, maxCityLength) : "";

  const portfolio = isValidPortfolioId(data.portfolio) ? data.portfolio : "";
  if (!portfolio) {
    errors.push("Property group is invalid.");
  }

  if (errors.length > 0) {
    return { ok: false, errors } as const;
  }

  return {
    ok: true,
    data: {
      building,
      city: city || undefined,
      portfolio: portfolio as WaitlistInput["portfolio"],
    },
  } as const;
};
