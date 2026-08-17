import { useEffect, useState } from "react";
import { api, formatFullDate } from "../api";
import AddPhotoModal from "../components/AddPhotoModal";
import { IconPlus, IconTrash, IconX, IconCamera } from "../components/Icons";

export default function Progress() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewing, setViewing] = useState(null);

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

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Progress Photos</h1>
          <p className="page-subtitle">A private timeline of your physique over time</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <IconPlus width={15} height={15} /> Add photo
        </button>
      </div>

      {loading ? (
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
