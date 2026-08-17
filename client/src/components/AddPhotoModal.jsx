import { useState } from "react";
import { todayStr } from "../api";
import { IconX, IconCamera } from "./Icons";

const MAX_DIMENSION = 1000;
const JPEG_QUALITY = 0.85;

function resizeToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Couldn't read that image."));
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width >= height) {
            height = Math.round((height / width) * MAX_DIMENSION);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width / height) * MAX_DIMENSION);
            height = MAX_DIMENSION;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function AddPhotoModal({ onClose, onAdd }) {
  const [preview, setPreview] = useState(null);
  const [date, setDate] = useState(todayStr());
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setError("");
    try {
      const dataUrl = await resizeToDataUrl(file);
      setPreview(dataUrl);
    } catch (err) {
      setError(err.message || "Couldn't process that image.");
    }
  }

  async function handleSave() {
    if (!preview) return;
    setSaving(true);
    try {
      await onAdd({ date, note: note.trim() || null, photo_data: preview });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add progress photo</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <IconX width={18} height={18} />
          </button>
        </div>
        <div className="modal-body">
          {!preview ? (
            <label className="photo-dropzone">
              <IconCamera width={26} height={26} />
              <div className="font-semibold mt-8">Choose a photo</div>
              <div className="text-xs text-muted mt-8">JPG or PNG · resized automatically</div>
              <input type="file" accept="image/*" onChange={handleFile} hidden />
            </label>
          ) : (
            <div className="flex-col gap-16">
              <div className="photo-preview-wrap">
                <img src={preview} alt="Selected preview" className="photo-preview-img" />
                <button className="btn btn-secondary btn-sm" onClick={() => setPreview(null)}>
                  Choose a different photo
                </button>
              </div>
              <div className="field">
                <label>Date</label>
                <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="field">
                <label>Note (optional)</label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="e.g. 12 weeks in, cutting phase"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>
          )}
          {error && (
            <div className="text-sm mt-16" style={{ color: "var(--status-critical)" }}>
              {error}
            </div>
          )}
        </div>
        {preview && (
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save photo"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
