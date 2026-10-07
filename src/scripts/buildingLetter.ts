import {
  buildBuildingLetter,
  describeBuildingLetter,
  type LetterCopyRecipient,
  type LetterIssue,
} from "../lib/buildingLetter";

/*
 * Joint repair-plan letter page. Builds the preview in the browser.
 * "Save to building ledger" creates a "Building-wide message" record, then adds the reply date
 * as a dated fact. Names and signatures are never sent.
 */

const root = document.querySelector<HTMLElement>("[data-letter-builder]");
const output = document.querySelector<HTMLElement>("[data-letter-output]");

const readIssues = (): LetterIssue[] => {
  try {
    const parsed = JSON.parse(root?.dataset.issues || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

if (root && output) {
  const building = root.dataset.building || "";
  const today = root.dataset.today || "";
  const portfolio = root.dataset.portfolio || "other";
  const allIssues = readIssues();
  const status = document.querySelector<HTMLElement>("[data-letter-status]");
  const householdsInput = root.querySelector<HTMLInputElement>("[data-letter-households]");
  const replyByInput = root.querySelector<HTMLInputElement>("[data-letter-reply-by]");
  const wardInput = root.querySelector<HTMLInputElement>("[data-letter-ward]");
  const simpleInput = root.querySelector<HTMLInputElement>("[data-letter-simple]");
  const saveButton = document.querySelector<HTMLButtonElement>("[data-letter-save]");

  const setStatus = (message: string) => {
    if (status) {
      status.textContent = message;
    }
  };

  const selectedIssues = () => {
    const checked = new Set(
      Array.from(root.querySelectorAll<HTMLInputElement>("[data-letter-issue]"))
        .filter((input) => input.checked)
        .map((input) => input.value)
    );
    return allIssues.filter((issue) => checked.has(issue.id));
  };

  const readLetter = () => {
    const ward = Number(wardInput?.value);
    return buildBuildingLetter({
      building,
      today,
      issues: selectedIssues(),
      households: Number(householdsInput?.value) || 0,
      replyBy: replyByInput?.value || "",
      copyTo: Array.from(root.querySelectorAll<HTMLInputElement>("[data-letter-copy]"))
        .filter((input) => input.checked)
        .map((input) => input.value as LetterCopyRecipient),
      ward: Number.isFinite(ward) && ward > 0 ? ward : undefined,
      simple: Boolean(simpleInput?.checked),
    });
  };

  const render = () => {
    output.textContent = readLetter();
  };

  root.addEventListener("input", render);
  root.addEventListener("change", render);
  root.querySelector("[data-letter-form]")?.addEventListener("submit", (event) => event.preventDefault());

  document.querySelector("[data-letter-copy-text]")?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(readLetter());
      setStatus("Letter copied.");
    } catch {
      setStatus("Could not copy. Select the letter text and copy it.");
    }
  });

  document.querySelector("[data-print]")?.addEventListener("click", () => window.print());

  saveButton?.addEventListener("click", async () => {
    const issues = selectedIssues();
    const replyBy = replyByInput?.value || "";
    if (issues.length === 0) {
      setStatus("Choose at least one problem.");
      return;
    }
    saveButton.disabled = true;
    setStatus("Saving...");
    try {
      const startDate = issues.map((issue) => issue.startDate).filter(Boolean).sort()[0] || today;
      const created = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          building,
          issue: "building",
          stage: "A",
          language: "en",
          portfolio,
          startDate,
          reportDate: today,
          reportCount: 1,
          simpleEnglish: Boolean(simpleInput?.checked),
          zone: "",
          issueDetails: { issueDescription: describeBuildingLetter(issues.length) },
        }),
      });
      const createdPayload = await created.json().catch(() => ({}));
      if (!created.ok || !createdPayload?.id) {
        throw new Error(createdPayload?.error || "We could not save the letter.");
      }
      if (replyBy) {
        const fact = await fetch(`/api/submissions/${encodeURIComponent(createdPayload.id)}/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "reply_due", date: replyBy }),
        });
        if (!fact.ok) {
          setStatus("Saved. Add the reply date on the record page.");
        }
      }
      window.location.assign(createdPayload.url || `/submissions/${encodeURIComponent(createdPayload.id)}`);
    } catch (error) {
      saveButton.disabled = false;
      setStatus(error instanceof Error ? error.message : "We could not save the letter.");
    }
  });

  render();
}
