export default function FoodCard({ item, onAdd }) {
  return (
    <article className="card">
      <div className="card-art">{item.emoji}</div>
      <div className="card-body">
        <h3>{item.name}</h3>
        <p>{item.desc}</p>
        <div className="card-foot">
          <span className="price">₹{item.price.toFixed(2)}</span>
          <button className="btn primary small" onClick={() => onAdd(item.id)}>
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}
