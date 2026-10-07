/*
 * Canvass tally page. Counts are kept in this browser until saved, so a reload at a door does not
 * lose them. Storage can be blocked (private mode); the page still works without it.
 */

const root = document.querySelector<HTMLElement>("[data-canvass]");
const form = root?.querySelector<HTMLFormElement>("[data-canvass-form]");

type Counts = Record<string, number>;

if (root && form) {
  const building = root.dataset.building || "";
  const draftKey = `canvass-draft:${building}`;
  const status = form.querySelector<HTMLElement>("[data-canvass-status]");
  const setStatus = (message: string) => {
    if (status) {
      status.textContent = message;
    }
  };

  const readDraft = (): Counts => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(draftKey) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  };
  const writeDraft = (counts: Counts) => {
    try {
      window.localStorage.setItem(draftKey, JSON.stringify(counts));
    } catch {
      // Storage blocked: counts stay in memory only.
    }
  };
  const clearDraft = () => {
    try {
      window.localStorage.removeItem(draftKey);
    } catch {
      // Nothing to clear.
    }
  };

  const counts: Counts = readDraft();
  const render = () => {
    form.querySelectorAll<HTMLOutputElement>("[data-count]").forEach((output) => {
      output.textContent = String(counts[output.dataset.count || ""] ?? 0);
    });
  };

  form.querySelectorAll<HTMLButtonElement>("[data-step]").forEach((button) => {
    button.addEventListener("click", () => {
      const field = button.dataset.field || "";
      const next = Math.min(999, Math.max(0, (counts[field] ?? 0) + Number(button.dataset.step)));
      counts[field] = next;
      writeDraft(counts);
      render();
    });
  });

  form.querySelector("[data-canvass-reset]")?.addEventListener("click", () => {
    if (window.confirm("Clear all counts on this phone?")) {
      Object.keys(counts).forEach((key) => delete counts[key]);
      clearDraft();
      render();
      setStatus("Counts cleared.");
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const { householdsReached = 0, ...rest } = counts;
    const date = (form.elements.namedItem("date") as HTMLInputElement).value;
    setStatus("Saving...");
    try {
      const response = await fetch("/api/buildings/canvass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ building, date, householdsReached, tallies: rest }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Could not save the canvass.");
      }
      clearDraft();
      setStatus("Saved. Reloading...");
      window.location.reload();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save the canvass.");
    }
  });

  document.querySelectorAll<HTMLButtonElement>("[data-canvass-remove]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!window.confirm("Remove this canvass?")) {
        return;
      }
      const response = await fetch("/api/buildings/canvass", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ building, canvassId: button.dataset.canvassRemove }),
      });
      if (response.ok) {
        window.location.reload();
      } else {
        const payload = await response.json().catch(() => ({}));
        setStatus(payload?.error || "Could not remove the canvass.");
      }
    });
  });

  render();
}

export {};
