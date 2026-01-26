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
});
