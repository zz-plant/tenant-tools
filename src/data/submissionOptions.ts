import { portfolioOptions } from "./portfolioOptions";
import type { PortfolioId } from "./portfolioOptions";
import { zoneOptions } from "./notice/guidance";
import type { ZoneId } from "./notice/guidance";

export const supportedLanguages = ["en", "es", "hi", "pl"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const noticeStages = ["A", "B", "C"] as const;
export type NoticeStage = (typeof noticeStages)[number];

export const submissionStatuses = ["open", "resolved", "archived"] as const;
export type SubmissionStatus = (typeof submissionStatuses)[number];

export type { PortfolioId } from "./portfolioOptions";
export type { ZoneId } from "./notice/guidance";

export const allowedZones = zoneOptions.map((option) => option.id) as ZoneId[];

export const allowedPortfolios = portfolioOptions.map((option) => option.id) as PortfolioId[];
