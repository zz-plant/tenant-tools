import { checkEntryNotice } from "../lib/entryNotice";
import { checkFairNotice } from "../lib/fairNotice";
import { addDays, formatDate, formatTimelineDate } from "../lib/dateUtils";
import { isRecordEventType, recordEventDefinitions, takesDeliveryMethod } from "../lib/recordEvents";
import type { NoticeTier } from "../data/rules";

/*
 * "Add a dated fact" on the record page. Does nothing when the form is not on the page.
 * The Fair Notice and entry notice checks run only in the browser. Their answers are never sent or saved.
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
  const entryCheck = form.querySelector<HTMLElement>("[data-entry-notice-check]");
  const entryNoticeTime = form.querySelector<HTMLInputElement>("[data-entry-notice-time]");
  const entryDate = form.querySelector<HTMLInputElement>("[data-entry-date]");
  const entryTime = form.querySelector<HTMLInputElement>("[data-entry-time]");
  const entryResult = form.querySelector<HTMLElement>("[data-entry-result]");
  const submitButton = form.querySelector<HTMLButtonElement>("[data-fact-submit]");
  const status = form.querySelector<HTMLElement>("[data-fact-status]");
  const tiers = readTiers();
  const chips = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-fact-chip]"));

  // Most facts are logged the day they happen, so the date starts as today. A reply deadline starts
  // 14 days out (the usual RLTO repair period). Once someone edits the date, it is left alone.
  const localToday = formatDate(new Date());
  const defaultToday = today && localToday > today ? today : localToday;
  let dateIsDefault = true;
  const defaultDateFor = (type: string) =>
    type === "reply_due" ? formatDate(addDays(new Date(`${defaultToday}T12:00:00`), 14)) : defaultToday;
  if (dateInput) {
    dateInput.value = defaultToday;
    dateInput.addEventListener("input", () => {
      dateIsDefault = false;
    });
  }

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

  // "14:30" -> "2:30 PM"
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours < 12 ? "AM" : "PM"}`;
  };

  const updateEntryNotice = () => {
    if (!entryResult) {
      return;
    }
    const check = checkEntryNotice({
      noticeDate: dateInput?.value ?? "",
      noticeTime: entryNoticeTime?.value ?? "",
      entryDate: entryDate?.value ?? "",
      entryTime: entryTime?.value ?? "",
    });
    if (!check) {
      entryResult.textContent = "Add the date the notice arrived and the date they plan to enter.";
      return;
    }
    const given = check.hoursGiven === undefined ? `${check.daysGiven} days` : `${check.hoursGiven} hours`;
    const lines: string[] = [];
    if (check.result === "on_time") {
      lines.push(`The notice gave ${given}. The rule asks for at least 2 days (48 hours).`);
    } else if (check.result === "late") {
      lines.push(`The notice gave ${given}. The rule asks for at least 2 days (48 hours).`);
      if (check.latestOnTime) {
        lines.push(
          `To be on time, it had to arrive by ${formatTimelineDate(check.latestOnTime.date)} at ${formatTime(check.latestOnTime.time)}.`
        );
      }
      lines.push("Keep the notice. You can ask management in writing for a new time.");
    } else {
      lines.push("The notice came 2 days before the entry date. Add both times to check the hours.");
    }
    if (check.outsideReasonableHours) {
      lines.push("The planned time is outside 8 AM to 8 PM. The law treats 8 AM to 8 PM as reasonable.");
    }
    entryResult.textContent = lines.join(" ");
  };

  const updateForType = () => {
    const type = typeSelect?.value ?? "";
    const definition = isRecordEventType(type) ? recordEventDefinitions[type] : null;
    chips.forEach((chip) => chip.classList.toggle("fact-tag-included", chip.dataset.factChip === type));
    if (dateInput && dateIsDefault) {
      dateInput.value = defaultDateFor(type);
    }
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
    if (refInput) {
      // "How you sent it" suggests email, mail, and so on. Number fields suggest nothing.
      if (isRecordEventType(type) && takesDeliveryMethod(type)) {
        refInput.setAttribute("list", "fact-delivery-options");
      } else {
        refInput.removeAttribute("list");
      }
    }
    if (afterRequestNote) {
      afterRequestNote.hidden = definition?.group !== "after_request";
    }
    if (fairCheck) {
      fairCheck.hidden = !fairNoticeTypes.has(type);
      updateFairNotice();
    }
    if (entryCheck) {
      entryCheck.hidden = type !== "entry_notice_received";
      updateEntryNotice();
    }
  };

  typeSelect?.addEventListener("change", updateForType);
  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      const type = chip.dataset.factChip ?? "";
      if (!typeSelect || !isRecordEventType(type)) {
        return;
      }
      typeSelect.value = type;
      updateForType();
      // Next tap: the number for a 311 request, otherwise "Add to timeline".
      (recordEventDefinitions[type].refLabel ? refInput : submitButton)?.focus();
    })
  );
  [dateInput, fairChangeDate].forEach((input) => input?.addEventListener("input", updateFairNotice));
  fairTier?.addEventListener("change", updateFairNotice);
  [dateInput, entryNoticeTime, entryDate, entryTime].forEach((input) => input?.addEventListener("input", updateEntryNotice));

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
