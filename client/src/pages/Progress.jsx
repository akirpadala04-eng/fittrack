import { useEffect, useState } from "react";
import { api, formatFullDate } from "../api";
import AddPhotoModal from "../components/AddPhotoModal";
import { IconPlus, IconTrash, IconX, IconCamera } from "../components/Icons";

export default function Progress() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [beforeId, setBeforeId] = useState(null);
  const [afterId, setAfterId] = useState(null);

  function reload() {
    setLoading(true);
    api.getPhotos().then((p) => {
      setPhotos(p);
      setLoading(false);
    });
  }

  useEffect(reload, []);

  async function handleAdd(data) {
    await api.createPhoto(data);
    setShowModal(false);
    reload();
  }

  async function handleDelete(id) {
    await api.deletePhoto(id);
    if (viewing?.id === id) setViewing(null);
    reload();
  }

  const sortedAsc = [...photos].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id - b.id));
  const canCompare = photos.length >= 2;

  function toggleCompare() {
    if (!compareMode && canCompare) {
      setBeforeId(sortedAsc[0].id);
      setAfterId(sortedAsc[sortedAsc.length - 1].id);
    }
    setCompareMode((c) => !c);
  }

  const beforePhoto = sortedAsc.find((p) => p.id === beforeId) || null;
  const afterPhoto = sortedAsc.find((p) => p.id === afterId) || null;

  let gapLabel = null;
  if (beforePhoto && afterPhoto) {
    const d1 = new Date(beforePhoto.date + "T00:00:00");
    const d2 = new Date(afterPhoto.date + "T00:00:00");
    const diffDays = Math.abs(Math.round((d2 - d1) / 86400000));
    gapLabel =
      diffDays >= 14
        ? `${Math.round(diffDays / 7)} weeks apart`
        : `${diffDays} day${diffDays === 1 ? "" : "s"} apart`;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Progress Photos</h1>
          <p className="page-subtitle">A private timeline of your physique over time</p>
        </div>
        <div className="flex gap-8">
          {canCompare && (
            <button
              className={`btn ${compareMode ? "btn-primary" : "btn-secondary"}`}
              onClick={toggleCompare}
            >
              Compare
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <IconPlus width={15} height={15} /> Add photo
          </button>
        </div>
      </div>

      {compareMode && canCompare ? (
        <div className="card">
          <div className="grid grid-2 mb-16">
            <div className="field">
              <label>Before</label>
              <select
                className="select"
                value={beforeId ?? ""}
                onChange={(e) => setBeforeId(Number(e.target.value))}
              >
                {sortedAsc.map((p) => (
                  <option key={p.id} value={p.id}>
                    {formatFullDate(p.date)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>After</label>
              <select
                className="select"
                value={afterId ?? ""}
                onChange={(e) => setAfterId(Number(e.target.value))}
              >
                {sortedAsc.map((p) => (
                  <option key={p.id} value={p.id}>
                    {formatFullDate(p.date)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {gapLabel && (
            <div className="text-sm font-semibold text-secondary mb-16" style={{ textAlign: "center" }}>
              {gapLabel}
            </div>
          )}

          <div className="grid grid-2">
            <div className="flex-col gap-8" style={{ alignItems: "center" }}>
              <img
                src={beforePhoto?.photo_data}
                alt={`Before photo from ${beforePhoto ? formatFullDate(beforePhoto.date) : ""}`}
                style={{ width: "100%", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", objectFit: "cover" }}
              />
              <div className="text-sm font-semibold">{beforePhoto && formatFullDate(beforePhoto.date)}</div>
            </div>
            <div className="flex-col gap-8" style={{ alignItems: "center" }}>
              <img
                src={afterPhoto?.photo_data}
                alt={`After photo from ${afterPhoto ? formatFullDate(afterPhoto.date) : ""}`}
                style={{ width: "100%", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", objectFit: "cover" }}
              />
              <div className="text-sm font-semibold">{afterPhoto && formatFullDate(afterPhoto.date)}</div>
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="card empty-row">Loading…</div>
      ) : photos.length === 0 ? (
        <div className="card photo-empty-state">
          <IconCamera width={30} height={30} />
          <div className="font-semibold mt-8">No progress photos yet</div>
          <div className="text-sm text-muted mt-8">
            Add your first photo to start tracking changes over time.
          </div>
          <button className="btn btn-primary mt-16" onClick={() => setShowModal(true)}>
            <IconPlus width={15} height={15} /> Add photo
          </button>
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map((p) => (
            <div className="photo-card" key={p.id}>
              <button className="photo-card-img-btn" onClick={() => setViewing(p)}>
                <img src={p.photo_data} alt={`Progress photo from ${formatFullDate(p.date)}`} />
              </button>
              <div className="photo-card-footer">
                <div>
                  <div className="photo-card-date">{formatFullDate(p.date)}</div>
                  {p.note && <div className="photo-card-note">{p.note}</div>}
                </div>
                <button className="btn btn-danger-ghost btn-icon" onClick={() => handleDelete(p.id)} aria-label="Delete photo">
                  <IconTrash width={15} height={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <AddPhotoModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}

      {viewing && (
        <div className="modal-backdrop" onClick={() => setViewing(null)}>
          <div className="modal photo-lightbox" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{formatFullDate(viewing.date)}</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setViewing(null)}>
                <IconX width={18} height={18} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: 0 }}>
              <img src={viewing.photo_data} alt={`Progress photo from ${formatFullDate(viewing.date)}`} className="photo-lightbox-img" />
            </div>
            {viewing.note && <div className="modal-body" style={{ paddingTop: 14 }}>{viewing.note}</div>}
            <div className="modal-footer">
              <button className="btn btn-danger-ghost" onClick={() => handleDelete(viewing.id)}>
                <IconTrash width={15} height={15} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
