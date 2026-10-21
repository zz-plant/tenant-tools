/* "Who to send notices to" steward form. Does nothing when the form is not on the page. */

const root = document.querySelector<HTMLElement>("[data-contacts]");
const form = root?.querySelector<HTMLFormElement>("[data-contacts-form]");

if (root && form) {
  const building = root.dataset.building || "";
  const status = form.querySelector<HTMLElement>("[data-contacts-status]");
  const setStatus = (message: string) => {
    if (status) {
      status.textContent = message;
    }
  };

  const send = async (method: "POST" | "DELETE", body: Record<string, unknown>, failure: string) => {
    try {
      const response = await fetch("/api/buildings/contacts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ building, ...body }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || failure);
      }
      setStatus("Saved. Reloading...");
      window.location.reload();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : failure);
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    setStatus("Saving...");
    void send("POST", Object.fromEntries(new FormData(form)), "Could not save the card.");
  });

  form.querySelector("[data-contacts-clear]")?.addEventListener("click", () => {
    if (window.confirm("Clear who to send notices to for this building?")) {
      void send("DELETE", {}, "Could not clear the card.");
    }
  });
}

export {};
