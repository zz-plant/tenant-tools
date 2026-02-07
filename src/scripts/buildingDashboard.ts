declare global {
  interface Window {
    __BUILDING_DASHBOARD__?: {
      stewardKey?: string;
      isSteward?: boolean;
    };
  }
}

const dashboardConfig = window.__BUILDING_DASHBOARD__;
const stewardKeyValue = dashboardConfig?.stewardKey ?? "";
const isStewardMode = Boolean(dashboardConfig?.isSteward);

type SubmissionStatus = "open" | "resolved" | "archived";
const statusOrder: SubmissionStatus[] = ["open", "resolved", "archived"];

const updateReportCount = (id: string, nextCount: number) => {
  const countEl = document.querySelector(`[data-report-count="${id}"]`);
  if (countEl) {
    countEl.textContent = String(nextCount);
  }
};

const setReportStatus = (id: string, message: string, isError = false) => {
  const statusEl = document.querySelector(`[data-report-status="${id}"]`) as HTMLElement | null;
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#9a2b2b" : "#1d3b2a";
};

const updateStatusCounts = () => {
  statusOrder.forEach((status) => {
    const group = document.querySelector(`[data-status-group="${status}"]`) as HTMLElement | null;
    if (!group) return;

    const cards = group.querySelectorAll("[data-submission-id]").length;

    const groupCounter = group.querySelector(`[data-status-count="${status}"]`) as HTMLElement | null;
    if (groupCounter) {
      groupCounter.textContent = String(cards);
    }

    const summaryCounter = document.querySelector(`[data-summary-count="${status}"]`) as HTMLElement | null;
    if (summaryCounter) {
      summaryCounter.textContent = String(cards);
    }
  });
};

const moveCardToStatusGroup = (id: string, nextStatus: SubmissionStatus) => {
  const card = document.querySelector(`[data-submission-id="${id}"]`) as HTMLElement | null;
  const targetGroup = document.querySelector(`[data-status-group="${nextStatus}"]`) as HTMLElement | null;
  if (!card || !targetGroup) {
    updateStatusCounts();
    return;
  }

  const firstCard = targetGroup.querySelector("[data-submission-id]");
  if (firstCard) {
    targetGroup.insertBefore(card, firstCard);
  } else {
    const helper = targetGroup.querySelector(".helper");
    if (helper) {
      helper.remove();
    }
    targetGroup.appendChild(card);
  }

  card.dataset.currentStatus = nextStatus;
  updateStatusCounts();
};

document.querySelectorAll("[data-report-button]").forEach((button) => {
  button.addEventListener("click", async () => {
    const id = button.getAttribute("data-submission-id");
    if (!id) return;
    const defaultLabel = button.getAttribute("data-default-label") || "Me too";
    button.setAttribute("disabled", "true");
    button.textContent = "Saving...";
    setReportStatus(id, "Saving your report...");
    try {
      const response = await fetch(`/api/submissions/${id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ increment: 1 }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "We could not update the report count.");
      }
      updateReportCount(id, payload.reportCount ?? 0);
      setReportStatus(id, "Your report was added.");
    } catch (error) {
      setReportStatus(id, error instanceof Error ? error.message : "We could not add your report.", true);
    } finally {
      button.removeAttribute("disabled");
      button.textContent = defaultLabel;
    }
  });
});

document.querySelectorAll("[data-status-save]").forEach((button) => {
  button.addEventListener("click", async () => {
    const id = button.getAttribute("data-submission-id");
    if (!id || !isStewardMode) return;

    const defaultLabel = button.getAttribute("data-default-label") || "Save";
    const select = document.querySelector(`[data-status-select][data-submission-id="${id}"]`) as HTMLSelectElement | null;
    const note = document.querySelector(`[data-status-note="${id}"]`) as HTMLElement | null;
    const nextStatus = select?.value as SubmissionStatus | undefined;
    const currentCard = document.querySelector(`[data-submission-id="${id}"]`) as HTMLElement | null;
    const currentStatus = currentCard?.dataset.currentStatus as SubmissionStatus | undefined;

    if (!nextStatus) return;
    if (nextStatus === currentStatus) {
      if (note) {
        note.textContent = "Status is already current.";
        note.style.color = "";
      }
      return;
    }

    button.setAttribute("disabled", "true");
    button.textContent = "Saving...";
    if (note) {
      note.textContent = "Saving status...";
      note.style.color = "";
    }

    try {
      const response = await fetch(
        `/api/submissions/${id}/status?stewardKey=${encodeURIComponent(stewardKeyValue)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        }
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "We could not update the status.");
      }

      moveCardToStatusGroup(id, nextStatus);
      if (note) {
        note.textContent = "Status saved.";
      }
    } catch (error) {
      if (note) {
        note.textContent = error instanceof Error ? error.message : "We could not update the status.";
        note.style.color = "#9a2b2b";
      }
    } finally {
      button.removeAttribute("disabled");
      button.textContent = defaultLabel;
    }
  });
});
