/*
 * Steward tools page: issue or remove building keys, and run the emergency wipe in batches.
 * The steward key travels in the httpOnly cookie, never in this script.
 */

const tools = document.querySelector<HTMLElement>("[data-steward-tools]");
const stewardStatus = document.querySelector<HTMLElement>("[data-steward-status]");
const newKeyBox = document.querySelector<HTMLElement>("[data-new-key]");

const setStatus = (element: HTMLElement | null, message: string) => {
  if (element) {
    element.textContent = message;
  }
};

const postJson = async (url: string, method: "POST" | "DELETE", body: unknown) => {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "The request did not work. Check the steward key and try again.");
  }
  return payload;
};

const showNewKey = (building: string, key: string) => {
  if (!newKeyBox) {
    return;
  }
  const link = `${window.location.origin}/buildings/${encodeURIComponent(building)}?key=${encodeURIComponent(key)}`;
  newKeyBox.hidden = false;
  newKeyBox.querySelector("[data-new-key-building]")!.textContent = building;
  newKeyBox.querySelector("[data-new-key-value]")!.textContent = key;
  newKeyBox.querySelector("[data-new-key-link]")!.textContent = link;
  newKeyBox.querySelector("[data-copy-new-key]")?.addEventListener("click", () => navigator.clipboard.writeText(key));
  newKeyBox.querySelector("[data-copy-new-link]")?.addEventListener("click", () => navigator.clipboard.writeText(link));
  newKeyBox.scrollIntoView({ behavior: "smooth", block: "center" });
};

const issueKey = async (building: string) => {
  setStatus(stewardStatus, "Issuing a new key...");
  try {
    const result = await postJson("/api/steward/keys", "POST", { building });
    setStatus(stewardStatus, `New key issued for ${result.building}. Reload the page after you copy it.`);
    showNewKey(result.building, result.key);
  } catch (error) {
    setStatus(stewardStatus, error instanceof Error ? error.message : "Could not issue a key.");
  }
};

if (tools) {
  tools.querySelectorAll<HTMLButtonElement>("[data-issue-key]").forEach((button) => {
    button.addEventListener("click", () => {
      const building = button.dataset.issueKey || "";
      if (window.confirm(`Issue a new key for ${building}? The current key will stop working.`)) {
        void issueKey(building);
      }
    });
  });

  tools.querySelectorAll<HTMLButtonElement>("[data-remove-key]").forEach((button) => {
    button.addEventListener("click", async () => {
      const building = button.dataset.removeKey || "";
      if (!window.confirm(`Remove the key issued here for ${building}? The deploy-settings key, if any, will work again.`)) {
        return;
      }
      try {
        await postJson("/api/steward/keys", "DELETE", { building });
        setStatus(stewardStatus, "Key removed. Reloading...");
        window.location.reload();
      } catch (error) {
        setStatus(stewardStatus, error instanceof Error ? error.message : "Could not remove the key.");
      }
    });
  });

  tools.querySelector<HTMLFormElement>("[data-add-building]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = (event.currentTarget as HTMLFormElement).elements.namedItem("building") as HTMLInputElement | null;
    const building = input?.value.trim() ?? "";
    if (building) {
      void issueKey(building);
    }
  });
}

const wipeForm = document.querySelector<HTMLFormElement>("[data-wipe-form]");
const wipeStatus = document.querySelector<HTMLElement>("[data-wipe-status]");

wipeForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const building = (wipeForm.elements.namedItem("building") as HTMLSelectElement).value;
  const confirm = (wipeForm.elements.namedItem("confirm") as HTMLInputElement).value;
  if (!building || confirm !== building) {
    setStatus(wipeStatus, "Type the building name exactly to confirm.");
    return;
  }
  if (!window.confirm(`Delete all data for ${building}? This cannot be undone.`)) {
    return;
  }
  const submit = wipeForm.querySelector<HTMLButtonElement>("button[type=submit]");
  if (submit) {
    submit.disabled = true;
  }
  let total = 0;
  let emptySteps = 0;
  try {
    // Each step deletes a few records. KV listings can lag, so stop after several empty steps.
    for (let step = 0; step < 500 && emptySteps < 3; step += 1) {
      const result = await postJson("/api/steward/wipe", "POST", { building, confirm });
      total += result.deleted;
      setStatus(wipeStatus, `Deleted ${total} records so far...`);
      if (!result.remaining) {
        setStatus(wipeStatus, `Done. Deleted ${total} records for ${building}. Now issue a new key.`);
        return;
      }
      emptySteps = result.deleted === 0 ? emptySteps + 1 : 0;
    }
    setStatus(wipeStatus, `Deleted ${total} records. Some may take a minute to clear. Run the wipe again to finish.`);
  } catch (error) {
    setStatus(wipeStatus, error instanceof Error ? error.message : "The wipe stopped. Run it again.");
  } finally {
    if (submit) {
      submit.disabled = false;
    }
  }
});

export {};
