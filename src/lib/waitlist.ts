import { portfolioOptions } from "../data/portfolioOptions";
import { sanitizeLimitedText } from "./validation";

const allowedPortfolios = new Set(portfolioOptions.map((option) => option.id));
const maxBuildingLength = 140;
const maxCityLength = 60;

const containsUnitInfo = (value: string) =>
  /(?:\bapt\b|\bunit\b|\bsuite\b|\bste\b|#\s*\w+)/i.test(value);

export type WaitlistInput = {
  building: string;
  city?: string;
  portfolio: "continuum" | "other";
};

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

  const portfolio = typeof data.portfolio === "string" ? data.portfolio : "";
  if (!allowedPortfolios.has(portfolio)) {
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
