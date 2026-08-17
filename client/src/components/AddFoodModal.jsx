import { useEffect, useState } from "react";
import { api } from "../api";
import { IconSearch, IconX, IconPlus } from "./Icons";

export default function AddFoodModal({ mealLabel, onClose, onAdd }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recent, setRecent] = useState([]);
  const [selected, setSelected] = useState(null);
  const [servings, setServings] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getFoods({ favorite: "1" }).then(setFavorites);
    api.getRecentFoods(6).then(setRecent);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      api.getFoods({ q: query }).then((r) => {
        if (!cancelled) {
          setResults(r);
          setLoading(false);
        }
      });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  function handleAdd() {
    if (!selected) return;
    onAdd(selected.id, Number(servings) || 1);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add food to {mealLabel}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <IconX width={18} height={18} />
          </button>
        </div>
        <div className="modal-body">
          {!selected ? (
            <>
              <div className="search-input-wrap">
                <IconSearch />
                <input
                  className="input"
                  autoFocus
                  placeholder="Search foods (e.g. chicken breast, apple, rice)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              {!query && (favorites.length > 0 || recent.length > 0) && (
                <div className="mt-16 flex-col gap-16">
                  {favorites.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-muted mb-8">⭐ FAVORITES</div>
                      <div className="flex-col">
                        {favorites.map((f) => (
                          <div key={f.id} className="list-row" onClick={() => setSelected(f)}>
                            <div className="food-row-main">
                              <div className="food-row-name">{f.name}</div>
                              <div className="food-row-meta">{f.serving_size} {f.serving_unit}</div>
                            </div>
                            <div className="food-row-cals">{Math.round(f.calories)} cal</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {recent.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-muted mb-8">RECENTLY LOGGED</div>
                      <div className="flex-col">
                        {recent.map((f) => (
                          <div key={f.id} className="list-row" onClick={() => setSelected(f)}>
                            <div className="food-row-main">
                              <div className="food-row-name">{f.name}</div>
                              <div className="food-row-meta">{f.serving_size} {f.serving_unit}</div>
                            </div>
                            <div className="food-row-cals">{Math.round(f.calories)} cal</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-16 flex-col">
                {loading && <div className="empty-row">Searching…</div>}
                {!loading && query && results.length === 0 && (
                  <div className="empty-row">No foods found. Try a different search, or add a custom food from the Food Database page.</div>
                )}
                {!loading &&
                  (query || (favorites.length === 0 && recent.length === 0)) &&
                  results.map((f) => (
                    <div key={f.id} className="list-row" onClick={() => setSelected(f)}>
                      <div className="food-row-main">
                        <div className="food-row-name">
                          {f.name}
                          {f.brand ? <span className="text-muted"> · {f.brand}</span> : null}
                        </div>
                        <div className="food-row-meta">
                          {f.serving_size} {f.serving_unit}
                        </div>
                      </div>
                      <div className="food-row-cals">{Math.round(f.calories)} cal</div>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <div className="flex-col gap-16">
              <div className="card" style={{ background: "#fbfcfa" }}>
                <div className="font-bold">{selected.name}</div>
                <div className="text-sm text-muted mt-8">
                  Per {selected.serving_size} {selected.serving_unit}: {Math.round(selected.calories)} cal ·{" "}
                  {selected.protein}g protein · {selected.carbs}g carbs · {selected.fat}g fat
                </div>
              </div>
              <div className="field">
                <label>Number of servings</label>
                <input
                  type="number"
                  min="0.25"
                  step="0.25"
                  className="input"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="card" style={{ background: "var(--brand-light)", border: "none" }}>
                <div className="text-sm font-semibold">
                  Total: {Math.round(selected.calories * (Number(servings) || 0))} cal
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => setSelected(null)}>
                ← Choose a different food
              </button>
            </div>
          )}
        </div>
        {selected && (
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAdd}>
              <IconPlus width={15} height={15} /> Add to diary
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
