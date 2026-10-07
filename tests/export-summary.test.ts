import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildExportSummary } from "../src/lib/exportSummary";

describe("buildExportSummary", () => {
  it("formats the inspector summary with evidence and details", () => {
    const summary = buildExportSummary({
      exportAudience: "inspector",
      building: "2353 W Wabansia",
      portfolioLabel: "Continuum",
      issueLabel: "Heat outage",
      zoneLabel: "Common area",
      statusLabel: "Open",
      stageLabel: "Initial notice",
      startDate: "2024-01-01",
      reportDate: "2024-01-02",
      daysOpen: 1,
      impactCount: 3,
      language: "en",
      issueDetails: [
        { key: "temp", label: "Temperature (°F)", value: "62" },
        { key: "attachment", label: "Evidence note (optional)", value: "photo of thermostat" },
      ],
      evidence: "photo of thermostat",
      ticketDate: "2024-01-03",
      ticketNumber: "311-123",
    });

    assert.equal(
      summary,
      [
        "Inspector summary",
        "Building: 2353 W Wabansia",
        "Portfolio: Continuum",
        "Issue: Heat outage",
        "Status: Open",
        "Zone: Common area",
        "Stage: Initial notice",
        "Start date: 2024-01-01",
        "Report date: 2024-01-02",
        "Days open: 1",
        "Residents reporting: 3",
        "Evidence noted: photo of thermostat",
        "311 ticket date: 2024-01-03",
        "311 ticket number: 311-123",
        "Language: EN",
        "Issue details:",
        "- Temperature (°F): 62",
        "- Evidence note (optional): photo of thermostat",
        "Notes:",
        "- Resident-reported. Not verified.",
        "- Evidence files are stored privately.",
      ].join("\n")
    );
  });

  it("omits evidence details for management summaries", () => {
    const summary = buildExportSummary({
      exportAudience: "management",
      building: "2353 W Wabansia",
      portfolioLabel: "Continuum",
      issueLabel: "Heat outage",
      zoneLabel: "Common area",
      statusLabel: "Open",
      stageLabel: "Initial notice",
      startDate: "2024-01-01",
      reportDate: "2024-01-02",
      daysOpen: 1,
      impactCount: 3,
      language: "en",
      issueDetails: [
        { key: "temp", label: "Temperature (°F)", value: "62" },
        { key: "attachment", label: "Evidence note (optional)", value: "photo of thermostat" },
      ],
      evidence: "photo of thermostat",
    });

    assert.ok(!summary.includes("Evidence noted:"));
    assert.ok(!summary.includes("Evidence note (optional):"));
  });

  it("adds the first written notice and RLTO date for legal aid, not for management", () => {
    const base = {
      building: "2400 W Wabansia",
      portfolioLabel: "Main management company",
      issueLabel: "Water leak",
      zoneLabel: "Inside unit",
      statusLabel: "Open",
      stageLabel: "Follow-up",
      startDate: "2026-09-28",
      reportDate: "2026-10-05",
      daysOpen: 7,
      impactCount: 1,
      language: "en",
      issueDetails: [],
      evidence: "None listed",
      firstNoticeDate: "2026-10-01",
      noticeMilestone: { label: "14 days after first written notice (RLTO 5-12-110)", date: "2026-10-15" },
    };

    const legal = buildExportSummary({ ...base, exportAudience: "legal" });
    assert.ok(legal.includes("First written notice: 2026-10-01"));
    assert.ok(legal.includes("14 days after first written notice (RLTO 5-12-110): 2026-10-15"));

    const management = buildExportSummary({ ...base, exportAudience: "management" });
    assert.ok(!management.includes("First written notice"));
    assert.ok(!management.includes("RLTO"));
  });
});

