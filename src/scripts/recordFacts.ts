import { checkFairNotice } from "../lib/fairNotice";
import { formatTimelineDate } from "../lib/dateUtils";
import { isRecordEventType, recordEventDefinitions } from "../lib/recordEvents";
import type { NoticeTier } from "../data/rules";

/*
 * "Add a dated fact" on the record page. Does nothing when the form is not on the page.
 * The Fair Notice check runs only in the browser. Its answers are never sent or saved.
 */

const root = document.querySelector<HTMLElement>("[data-record-facts]");
const form = root?.querySelector<HTMLFormElement>("[data-facts-form]");

const fairNoticeTypes = new Set(["rent_increase_notice", "nonrenewal_notice"]);

const readTiers = (): NoticeTier[] => {
  try {
    const parsed = JSON.parse(root?.dataset.fairNoticeTiers || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

if (root && form) {
  const submissionId = root.dataset.submissionId || "";
  const today = root.dataset.today || "";
  const typeSelect = form.querySelector<HTMLSelectElement>("[data-fact-type]");
  const dateInput = form.querySelector<HTMLInputElement>("[data-fact-date]");
  const dateLabel = form.querySelector<HTMLElement>("[data-fact-date-label]");
  const refField = form.querySelector<HTMLElement>("[data-fact-ref-field]");
  const refLabel = form.querySelector<HTMLElement>("[data-fact-ref-label]");
  const refInput = form.querySelector<HTMLInputElement>("[data-fact-ref]");
  const afterRequestNote = form.querySelector<HTMLElement>("[data-after-request-note]");
  const fairCheck = form.querySelector<HTMLElement>("[data-fair-notice-check]");
  const fairTier = form.querySelector<HTMLSelectElement>("[data-fair-tier]");
  const fairChangeDate = form.querySelector<HTMLInputElement>("[data-fair-change-date]");
  const fairResult = form.querySelector<HTMLElement>("[data-fair-result]");
  const submitButton = form.querySelector<HTMLButtonElement>("[data-fact-submit]");
  const status = form.querySelector<HTMLElement>("[data-fact-status]");
  const tiers = readTiers();

  const setStatus = (message: string) => {
    if (status) {
      status.textContent = message;
    }
  };

  const updateFairNotice = () => {
    if (!fairResult) {
      return;
    }
    const check = checkFairNotice({
      tiers,
      tierId: fairTier?.value ?? "",
      noticeDate: dateInput?.value ?? "",
      changeDate: fairChangeDate?.value ?? "",
    });
    if (!check) {
      fairResult.textContent = "Add the date the notice arrived, how long you have lived here, and the start date.";
      return;
    }
    fairResult.textContent = check.onTime
      ? `The notice gave ${check.daysGiven} days. The rule asks for at least ${check.requiredDays} days.`
      : `The notice gave ${check.daysGiven} days. The rule asks for at least ${check.requiredDays} days. ` +
        `To be on time, it had to arrive by ${formatTimelineDate(check.latestOnTimeDate)}. ` +
        "Ask legal aid or a tenant group what this means for you.";
  };

  const updateForType = () => {
    const type = typeSelect?.value ?? "";
    const definition = isRecordEventType(type) ? recordEventDefinitions[type] : null;
    if (dateLabel) {
      dateLabel.textContent = definition?.dateLabel ?? "Date";
    }
    if (dateInput) {
      // Deadlines and promised dates can be later. Other facts already happened.
      if (definition && !definition.allowsFuture && today) {
        dateInput.max = today;
      } else {
        dateInput.removeAttribute("max");
      }
    }
    if (refField) {
      refField.hidden = !definition?.refLabel;
    }
    if (refLabel && definition?.refLabel) {
      refLabel.textContent = definition.refLabel;
    }
    if (refInput && !definition?.refLabel) {
      refInput.value = "";
    }
    if (afterRequestNote) {
      afterRequestNote.hidden = definition?.group !== "after_request";
    }
    if (fairCheck) {
      fairCheck.hidden = !fairNoticeTypes.has(type);
      updateFairNotice();
    }
  };

  typeSelect?.addEventListener("change", updateForType);
  [dateInput, fairChangeDate].forEach((input) => input?.addEventListener("input", updateFairNotice));
  fairTier?.addEventListener("change", updateFairNotice);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const type = typeSelect?.value ?? "";
    const date = dateInput?.value ?? "";
    if (!isRecordEventType(type) || !date) {
      setStatus("Choose what happened and add the date.");
      return;
    }
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Saving...";
    }
    try {
      const response = await fetch(`/api/submissions/${encodeURIComponent(submissionId)}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, date, ref: refInput?.value || undefined }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "We could not save this fact.");
      }
      setStatus("Added to the timeline.");
      window.location.reload();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "We could not save this fact.");
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Add to timeline";
      }
    }
  });

  root.querySelectorAll<HTMLButtonElement>("[data-fact-remove]").forEach((button) => {
    button.addEventListener("click", async () => {
      const eventId = button.dataset.eventId;
      if (!eventId) {
        return;
      }
      button.disabled = true;
      try {
        const response = await fetch(`/api/submissions/${encodeURIComponent(submissionId)}/events`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error || "We could not remove this fact.");
        }
        window.location.reload();
      } catch (error) {
        button.disabled = false;
        setStatus(error instanceof Error ? error.message : "We could not remove this fact.");
      }
    });
  });

  // Links such as "Add my 311 number" open the form with the fact type already chosen.
  const preset = new URLSearchParams(window.location.search).get("fact");
  if (typeSelect && isRecordEventType(preset)) {
    typeSelect.value = preset;
  }
  updateForType();
}
