import { useEffect, useState } from "react";
import { api } from "../api";
import CustomFoodModal from "../components/CustomFoodModal";
import { IconSearch, IconPlus, IconTrash, IconStar, IconStarFilled } from "../components/Icons";

export default function Foods() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favoriteOnly, setFavoriteOnly] = useState(false);

  useEffect(() => {
    api.getFoodCategories().then(setCategories);
  }, []);

  function reload() {
    setLoading(true);
    const params = { q: query, category };
    if (favoriteOnly) params.favorite = "1";
    api.getFoods(params).then((r) => {
      setFoods(r);
      setLoading(false);
    });
  }

  useEffect(() => {
    const t = setTimeout(reload, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, favoriteOnly]);

  async function handleCreate(data) {
    await api.createFood(data);
    setShowModal(false);
    api.getFoodCategories().then(setCategories);
    reload();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this custom food?")) return;
    await api.deleteFood(id);
    reload();
  }

  async function handleToggleFavorite(food) {
    setFoods((prev) => prev.map((f) => (f.id === food.id ? { ...f, is_favorite: f.is_favorite ? 0 : 1 } : f)));
    await api.setFoodFavorite(food.id, !food.is_favorite);
    if (favoriteOnly) reload();
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Food Database</h1>
          <p className="page-subtitle">{foods.length} foods available · search or add your own</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <IconPlus width={15} height={15} /> Add custom food
        </button>
      </div>

      <div className="flex gap-12 mt-16" style={{ marginBottom: 18 }}>
        <div className="search-input-wrap" style={{ flex: 1 }}>
          <IconSearch />
          <input
            className="input"
            placeholder="Search foods…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select className="select" style={{ width: 200 }} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          className={`btn btn-sm ${favoriteOnly ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setFavoriteOnly((v) => !v)}
        >
          {favoriteOnly ? <IconStarFilled width={14} height={14} /> : <IconStar width={14} height={14} />} Favorites
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div
          className="flex justify-between text-xs text-muted font-semibold"
          style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "#fbfcfa" }}
        >
          <span>Food</span>
          <span>Cal · P · C · F</span>
        </div>
        {loading ? (
          <div className="empty-row">Loading…</div>
        ) : foods.length === 0 ? (
          <div className="empty-row">No foods match your search.</div>
        ) : (
          foods.map((f) => (
            <div className="food-row" key={f.id}>
              <div className="food-row-main">
                <div className="food-row-name">
                  {f.name}
                  {f.is_custom ? <span className="pill pill-brand" style={{ marginLeft: 8 }}>Custom</span> : null}
                </div>
                <div className="food-row-meta">
                  {f.category} · {f.serving_size} {f.serving_unit}
                  {f.brand ? ` · ${f.brand}` : ""}
                </div>
              </div>
              <div className="food-row-right">
                <div className="text-sm" style={{ minWidth: 190, textAlign: "right" }}>
                  <span className="font-bold">{Math.round(f.calories)} cal</span>
                  <span className="text-muted"> · {f.protein}g · {f.carbs}g · {f.fat}g</span>
                </div>
                <button
                  className="btn btn-ghost btn-icon"
                  style={{ color: f.is_favorite ? "var(--status-warning)" : undefined }}
                  onClick={() => handleToggleFavorite(f)}
                  aria-label="Toggle favorite"
                >
                  {f.is_favorite ? <IconStarFilled width={15} height={15} /> : <IconStar width={15} height={15} />}
                </button>
                {f.is_custom ? (
                  <button className="btn btn-danger-ghost btn-icon" onClick={() => handleDelete(f.id)}>
                    <IconTrash width={15} height={15} />
                  </button>
                ) : (
                  <div style={{ width: 32 }} />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && <CustomFoodModal onClose={() => setShowModal(false)} onCreate={handleCreate} />}
    </div>
  );
}
