/*
 * Private evidence on the record page.
 * Photos are re-drawn on a canvas before upload. This drops EXIF data such as GPS location,
 * device name, and time. The server strips metadata again as a second layer.
 */

const MAX_EDGE = 2048;
const MAX_BYTES = 5 * 1024 * 1024;

const root = document.querySelector("[data-evidence]") as HTMLElement | null;

type EvidenceItem = { id: string; url: string; createdAt: string };

const reencodeAsJpeg = async (file: File): Promise<Blob> => {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("This browser cannot prepare the photo.");
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) {
    throw new Error("This browser cannot prepare the photo.");
  }
  return blob;
};

if (root) {
  const submissionId = root.dataset.submissionId || "";
  const isSteward = root.dataset.isSteward === "true";
  const grid = root.querySelector("[data-evidence-grid]") as HTMLElement | null;
  const countEl = root.querySelector("[data-evidence-count]") as HTMLElement | null;
  const form = root.querySelector("[data-evidence-form]") as HTMLFormElement | null;
  const fileInput = root.querySelector("[data-evidence-file]") as HTMLInputElement | null;
  const confirm = root.querySelector("[data-evidence-confirm]") as HTMLInputElement | null;
  const submit = root.querySelector("[data-evidence-submit]") as HTMLButtonElement | null;
  const status = root.querySelector("[data-evidence-status]") as HTMLElement | null;
  const apiBase = `/api/submissions/${encodeURIComponent(submissionId)}/evidence`;

  const setStatus = (message: string) => {
    if (status) status.textContent = message;
  };

  const refreshSubmitState = () => {
    if (submit) {
      submit.disabled = !(confirm?.checked && fileInput?.files && fileInput.files.length > 0);
    }
  };

  const render = (items: EvidenceItem[]) => {
    if (countEl) countEl.textContent = String(items.length);
    if (!grid) return;
    grid.replaceChildren();
    items.forEach((item, index) => {
      const figure = document.createElement("figure");
      figure.className = "evidence-item";
      const image = document.createElement("img");
      image.src = item.url;
      image.alt = `Evidence photo ${index + 1}`;
      image.loading = "lazy";
      image.referrerPolicy = "no-referrer";
      figure.append(image);
      if (isSteward) {
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "button button-compact button-secondary";
        remove.textContent = "Remove photo";
        remove.addEventListener("click", async () => {
          if (!window.confirm("Remove this photo? Use this for unsafe photos, such as faces or names.")) return;
          remove.disabled = true;
          const response = await fetch(`${apiBase}/${encodeURIComponent(item.id)}`, { method: "DELETE" });
          if (response.ok) {
            setStatus("Photo removed.");
            await load();
          } else {
            setStatus("We could not remove the photo.");
            remove.disabled = false;
          }
        });
        figure.append(remove);
      }
      grid.append(figure);
    });
  };

  const load = async () => {
    try {
      const response = await fetch(apiBase, { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (response.ok && Array.isArray(payload.items)) {
        render(payload.items as EvidenceItem[]);
      }
    } catch {
      setStatus("We could not load the photos.");
    }
  };

  fileInput?.addEventListener("change", refreshSubmitState);
  confirm?.addEventListener("change", refreshSubmitState);

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const file = fileInput?.files?.[0];
    if (!file || !confirm?.checked || !submit) return;
    submit.disabled = true;
    setStatus("Preparing the photo. Location details are removed...");
    try {
      const prepared = await reencodeAsJpeg(file);
      if (prepared.size > MAX_BYTES) {
        throw new Error("The photo is too large. The limit is 5 MB.");
      }
      setStatus("Uploading...");
      const response = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: prepared,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "We could not upload the photo.");
      }
      setStatus("Photo saved privately.");
      form.reset();
      await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "We could not upload the photo.");
    } finally {
      refreshSubmitState();
    }
  });

  void load();
}
