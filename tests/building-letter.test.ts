import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildBuildingLetter,
  describeBuildingLetter,
  isSavedBuildingLetter,
  type BuildingLetterInput,
} from "../src/lib/buildingLetter";
import { lintVerySimpleEnglish } from "../src/lib/copyLint";

const base: BuildingLetterInput = {
  building: "2400 W Wabansia",
  today: "2026-10-07",
  issues: [
    { id: "a", label: "Heat not working / not warm enough", startDate: "2026-10-01", reportCount: 5 },
    { id: "b", label: "Water leak / ceiling leak / water damage", startDate: "2026-09-03", reportCount: 2 },
  ],
  households: 12,
  replyBy: "2026-10-21",
  copyTo: [],
  simple: false,
};

describe("buildBuildingLetter", () => {
  it("lists problems, the household count, and the reply date", () => {
    const letter = buildBuildingLetter(base);
    assert.ok(letter.includes("Residents of 12 households signed this letter."));
    assert.ok(letter.includes("- Heat not working / not warm enough. Started Oct 1, 2026. 5 residents report it."));
    assert.ok(letter.includes("We request a written repair plan by Oct 21, 2026."));
    assert.ok(letter.endsWith("Residents of 2400 W Wabansia"));
  });

  it("leaves out household and report counts under 3", () => {
    const letter = buildBuildingLetter({ ...base, households: 2 });
    assert.ok(!letter.includes("households signed"));
    assert.ok(letter.includes("- Water leak / ceiling leak / water damage. Started Sep 3, 2026."));
    assert.ok(!letter.includes("2 residents"));
  });

  it("adds copy lines with the ward number when it is valid", () => {
    const letter = buildBuildingLetter({ ...base, copyTo: ["alderperson", "hud"], ward: 1 });
    assert.ok(letter.includes("Copies of this letter were sent to:"));
    assert.ok(letter.includes("- Office of the Alderperson, Ward 1"));
    assert.ok(letter.includes("- U.S. Department of Housing and Urban Development (HUD)"));
    assert.ok(!letter.includes("Chicago Housing Authority"));
    const badWard = buildBuildingLetter({ ...base, copyTo: ["alderperson"], ward: 99 });
    assert.ok(badWard.includes("- Office of the Alderperson\n") || badWard.includes("- Office of the Alderperson"));
    assert.ok(!badWard.includes("Ward 99"));
    assert.ok(!buildBuildingLetter(base).includes("Copies"));
  });

  it("has a Very simple English version with short lines", () => {
    const letter = buildBuildingLetter({ ...base, simple: true });
    assert.ok(letter.includes("We live at 2400 W Wabansia."));
    assert.ok(letter.includes("12 households signed this letter."));
    assert.ok(letter.includes("Please send a written repair plan by Oct 21, 2026."));
    assert.ok(!letter.includes("residents report it"));
  });

  it("keeps placeholders visible when facts are missing", () => {
    const letter = buildBuildingLetter({ ...base, building: "", issues: [], replyBy: "" });
    assert.ok(letter.includes("[ADDRESS]"));
    assert.ok(letter.includes("- [PROBLEM]"));
    assert.ok(letter.includes("[REPLY DATE]"));
  });

  it("stays clear of idioms, pressure, and threats in both versions", () => {
    for (const simple of [false, true]) {
      const letter = buildBuildingLetter({ ...base, simple, copyTo: ["alderperson", "cha", "hud"], ward: 32 });
      assert.deepEqual(lintVerySimpleEnglish(letter).warnings, []);
      assert.ok(!/legal action|sue|lawyer|withhold|strike|or else/i.test(letter), letter);
    }
  });
});

describe("describeBuildingLetter", () => {
  it("counts problems", () => {
    assert.equal(describeBuildingLetter(1), "Joint repair plan letter: 1 problem");
    assert.equal(describeBuildingLetter(3), "Joint repair plan letter: 3 problems");
  });

  it("recognizes saved letters so they are not listed as problems", () => {
    assert.equal(isSavedBuildingLetter(describeBuildingLetter(2)), true);
    assert.equal(isSavedBuildingLetter("broken elevator"), false);
    assert.equal(isSavedBuildingLetter(undefined), false);
  });
});

describe("alderperson meeting letter", () => {
  const input: BuildingLetterInput = {
    ...base,
    kind: "alderperson",
    ward: 32,
    managementLetterDate: "2026-09-20",
    noPlanReceived: true,
    attachSummary: true,
  };

  it("asks the ward office for a meeting and lists the management request", () => {
    const letter = buildBuildingLetter(input);
    assert.ok(letter.includes("To: Office of the Alderperson, Ward 32"));
    assert.ok(letter.includes("We are residents of 2400 W Wabansia, in your ward."));
    assert.ok(letter.includes("We asked building management for a written repair plan on Sep 20, 2026."));
    assert.ok(letter.includes("We have not received a plan."));
    assert.ok(letter.includes("We request a meeting with your office about these problems."));
    assert.ok(letter.includes("A printed summary of the problems and dates is attached."));
    assert.ok(!letter.includes("Copies of this letter"));
  });

  it("leaves out optional lines and keeps the simple version short", () => {
    const plain = buildBuildingLetter({ ...input, ward: undefined, managementLetterDate: undefined, noPlanReceived: false, attachSummary: false });
    assert.ok(plain.includes("To: Office of the Alderperson\n"));
    assert.ok(!plain.includes("in your ward"));
    assert.ok(!plain.includes("We asked building management"));
    const simple = buildBuildingLetter({ ...input, simple: true });
    assert.ok(simple.includes("We want to meet with your office about these problems."));
    assert.ok(simple.includes("We did not get a plan."));
    for (const letter of [plain, simple, buildBuildingLetter(input)]) {
      assert.deepEqual(lintVerySimpleEnglish(letter).warnings, []);
      assert.ok(!/legal action|vote|election|or else/i.test(letter), letter);
    }
  });

  it("saves as a letter, not as a problem", () => {
    assert.equal(describeBuildingLetter(2, "alderperson"), "Meeting request to the alderperson: 2 problems");
    assert.equal(isSavedBuildingLetter(describeBuildingLetter(2, "alderperson")), true);
  });
});

