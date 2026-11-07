import { useMemo, useState } from "react";
import PortalCard from "./components/PortalCard.jsx";
import FoodCard from "./components/FoodCard.jsx";
import MetricCard from "./components/MetricCard.jsx";

const ACCOUNTS = {
  admin: { username: "admin", password: "admin123", label: "Admin" },
  user: { username: "user", password: "user123", label: "User" },
  manager: { username: "manager", password: "manager123", label: "Manager" }
};

const INITIAL_CUSTOMERS = [
  { id: 1, name: "Aarav Reddy", email: "aarav@example.com", joined: "2026-01-14", orders: 3 },
  { id: 2, name: "Meera Iyer", email: "meera@example.com", joined: "2026-02-02", orders: 5 },
  { id: 3, name: "Rohan Shah", email: "rohan@example.com", joined: "2026-03-19", orders: 1 },
  { id: 4, name: "Sana Khan", email: "sana@example.com", joined: "2026-05-07", orders: 2 },
  { id: 5, name: "Vikram Rao", email: "vikram@example.com", joined: "2026-06-21", orders: 0 }
];

const MENU = [
  { id: 101, name: "Hyderabadi Chicken Biryani", price: 289, emoji: "🍛", desc: "Dum-cooked basmati, raita on the side." },
  { id: 102, name: "Paneer Butter Masala", price: 229, emoji: "🧀", desc: "Creamy tomato gravy with soft paneer." },
  { id: 103, name: "Masala Dosa", price: 119, emoji: "🥞", desc: "Crisp dosa, potato filling, two chutneys." },
  { id: 104, name: "Margherita Pizza", price: 249, emoji: "🍕", desc: "Wood-fired, fresh basil and mozzarella." },
  { id: 105, name: "Veg Burger Combo", price: 179, emoji: "🍔", desc: "Burger, fries and a small drink." },
  { id: 106, name: "Gulab Jamun (4 pcs)", price: 89, emoji: "🍮", desc: "Warm, syrup-soaked and soft." }
];

const RESTAURANTS = [
  { name: "Paradise Dum House", cuisine: "Biryani, Mughlai", eta: "30 min", rating: 4.6, emoji: "🍲" },
  { name: "Udupi Sunrise", cuisine: "South Indian", eta: "20 min", rating: 4.4, emoji: "🥥" },
  { name: "Oven & Ember", cuisine: "Pizza, Italian", eta: "35 min", rating: 4.3, emoji: "🔥" },
  { name: "Green Tiffin", cuisine: "Vegetarian", eta: "25 min", rating: 4.5, emoji: "🥗" },
  { name: "Sweet Tooth Corner", cuisine: "Desserts, Bakery", eta: "15 min", rating: 4.7, emoji: "🧁" },
  { name: "Burger Barn", cuisine: "Burgers, Fries", eta: "28 min", rating: 4.1, emoji: "🍟" }
];

const OFFERS = [
  { role: "Admin", title: "Welcome waiver", desc: "Platform fee waived for newly registered customers.", code: "ADMIN50", type: "info" },
  { role: "Admin", title: "Loyalty reward", desc: "Free dessert for customers with 5+ orders.", code: "LOYAL5", type: "info" },
  { role: "User", title: "Flat ₹50 off", desc: "On any order above ₹300.", code: "SAVE50", type: "flat", value: 50, min: 300 },
  { role: "User", title: "10% off your feast", desc: "Up to ₹100 off on orders above ₹200.", code: "FEAST10", type: "percent", value: 10, min: 200 },
  { role: "Manager", title: "Rush-hour priority", desc: "Priority cooking slot for orders added in the pipeline.", code: "MGR20", type: "info" },
  { role: "Manager", title: "Zero-reject week", desc: "Accept every order for a week to earn a badge.", code: "ZEROREJECT", type: "info" }
];

const INITIAL_ORDERS = [
  { id: 9001, customer: "Meera Iyer", items: "Masala Dosa x2", total: 238, status: "Cooking", decision: "Accepted" },
  { id: 9002, customer: "Rohan Shah", items: "Margherita Pizza x1", total: 249, status: "Pending", decision: null }
];

const STATUSES = ["Pending", "Cooking", "Out for Delivery", "Delivered"];
const money = (value) => `₹${Number(value).toFixed(2)}`;

function App() {
  const [page, setPage] = useState("home");
  const [role, setRole] = useState(null);
  const [loginTarget, setLoginTarget] = useState(null);
  const [afterLogin, setAfterLogin] = useState("home");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [nextOrderId, setNextOrderId] = useState(9003);
  const [cart, setCart] = useState([]);
  const [appliedCode, setAppliedCode] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [newItem, setNewItem] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [managerMessage, setManagerMessage] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [toast, setToast] = useState("");

  const activeOrders = orders.filter((o) => o.decision !== "Rejected" && o.status !== "Delivered").length;
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = subtotal === 0 || subtotal >= 500 ? 0 : 40;
  const selectedOffer = OFFERS.find((offer) => offer.code === appliedCode);
  const discount = selectedOffer && subtotal >= (selectedOffer.min || 0)
    ? selectedOffer.type === "flat" ? selectedOffer.value : selectedOffer.type === "percent" ? Math.min(100, subtotal * selectedOffer.value / 100) : 0
    : 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const navigate = (name) => {
    if (["admin", "user", "manager"].includes(name) && role !== name) {
      setLoginTarget(name);
      setAfterLogin(name);
      setUsername("");
      setPassword("");
      setLoginError("");
      return;
    }
    setPage(name);
    if (name === "cart") setCartMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeLogin = () => {
    setLoginTarget(null);
    setLoginError("");
  };

  const handleLogin = (event) => {
    event.preventDefault();
    const account = ACCOUNTS[loginTarget];
    if (account && username.trim() === account.username && password === account.password) {
      setRole(loginTarget);
      setPage(afterLogin);
      closeLogin();
      showToast(`Signed in as ${account.label}`);
    } else {
      setLoginError("Wrong username or password. Check the demo credentials above and try again.");
      setPassword("");
    }
  };

  const logout = () => {
    setRole(null);
    setPage("home");
    showToast("Logged out");
  };

  const addToCart = (id) => {
    const food = MENU.find((item) => item.id === id);
    if (!food) return;
    setCart((previous) => {
      const exists = previous.some((item) => item.id === id);
      return exists
        ? previous.map((item) => item.id === id ? { ...item, qty: item.qty + 1 } : item)
        : [...previous, { ...food, qty: 1 }];
    });
    showToast(`${food.name} added to cart`);
  };

  const changeQuantity = (id, delta) => {
    setCart((previous) => previous
      .map((item) => item.id === id ? { ...item, qty: item.qty + delta } : item)
      .filter((item) => item.qty > 0));
  };

  const removeFromCart = (id) => setCart((previous) => previous.filter((item) => item.id !== id));

  const placeOrder = () => {
    if (!cart.length) return;
    if (role !== "user") {
      setLoginTarget("user");
      setAfterLogin("cart");
      setUsername("");
      setPassword("");
      setLoginError("");
      return;
    }
    const itemSummary = cart.map((item) => `${item.name} x${item.qty}`).join(", ");
    const order = {
      id: nextOrderId,
      customer: "Aarav Reddy",
      items: itemSummary,
      total,
      status: "Pending",
      decision: null
    };
    setOrders((previous) => [...previous, order]);
    setNextOrderId((previous) => previous + 1);
    setCustomers((previous) => previous.map((c) => c.name === "Aarav Reddy" ? { ...c, orders: c.orders + 1 } : c));
    setCart([]);
    setAppliedCode(null);
    setCartMessage("Order placed. The kitchen manager will confirm it shortly.");
    showToast("Order placed");
  };

  const createOrder = (event) => {
    event.preventDefault();
    const price = Number(newPrice);
    if (!customerName.trim() || !newItem.trim() || newPrice === "" || !Number.isFinite(price) || price < 0) {
      setManagerMessage("Enter a customer, an item and a valid price.");
      return;
    }
    setOrders((previous) => [...previous, {
      id: nextOrderId,
      customer: customerName.trim(),
      items: newItem.trim(),
      total: price,
      status: "Pending",
      decision: null
    }]);
    setNextOrderId((previous) => previous + 1);
    setCustomers((previous) => {
      const known = previous.some((c) => c.name.toLowerCase() === customerName.trim().toLowerCase());
      if (known) return previous.map((c) => c.name.toLowerCase() === customerName.trim().toLowerCase() ? { ...c, orders: c.orders + 1 } : c);
      return [...previous, {
        id: previous.length + 1,
        name: customerName.trim(),
        email: `${customerName.trim().toLowerCase().replace(/\s+/g, ".")}@example.com`,
        joined: new Date().toISOString().slice(0, 10),
        orders: 1
      }];
    });
    setCustomerName("");
    setNewItem("");
    setNewPrice("");
    setManagerMessage("Order added to the pipeline.");
  };

  const updateOrder = (id, changes) => {
    setOrders((previous) => previous.map((order) => order.id === id ? { ...order, ...changes } : order));
  };

  const acceptOrder = (order) => {
    updateOrder(order.id, { decision: "Accepted", status: order.status === "Pending" ? "Cooking" : order.status });
  };

  const applyOffer = (code) => {
    setAppliedCode(code);
    setPage("cart");
    showToast(`Voucher ${code} selected`);
  };

  return (
    <div className="app-shell">
      <div className="ambient" aria-hidden="true"><i></i><i></i><i></i></div>

      <header className="topbar">
        <button className="wordmark" onClick={() => navigate("home")} aria-label="Foody home">Foody</button>
        <nav className="main-nav" aria-label="Main">
          {[
            ["home", "Dashboard"],
            ["restaurants", "Restaurants"],
            ["offers", "Offers"],
            ["cart", "Cart"]
          ].map(([key, label]) => (
            <button key={key} className={`nav-btn ${page === key ? "active" : ""}`} onClick={() => navigate(key)}>
              {label}{key === "cart" && <span className="badge">{cartCount}</span>}
            </button>
          ))}
        </nav>
        {role && <div className="session"><span className="dot"></span><span>Signed in as {ACCOUNTS[role].label}</span><button className="btn small ghost" onClick={logout}>Log Out</button></div>}
      </header>

      <main>
        {page === "home" && (
          <section className="view active">
            <div className="hero">
              <div className="hero-copy">
                <h1>Dinner, delivered before you finish deciding.</h1>
                <p>Foody connects hungry customers, busy kitchens and the people who run it all. Pick your portal and sign in to get started.</p>
              </div>
              <div className="hero-art" aria-hidden="true"><span>🍛</span><span>🍕</span><span>🥗</span><span>🍜</span></div>
            </div>
            <div className="portals">
              <PortalCard icon="🛡️" title="Admin Module" description="Track customers and live order volume across the platform." className="p-admin" onClick={() => navigate("admin")} />
              <PortalCard icon="🍽️" title="User Module" description="Browse the menu, build your cart and check out in seconds." className="p-user" onClick={() => navigate("user")} />
              <PortalCard icon="👨‍🍳" title="Manager Module" description="Accept, reject and move every order through the kitchen." className="p-manager" onClick={() => navigate("manager")} />
            </div>
          </section>
        )}

        {page === "admin" && role === "admin" && (
          <section className="view active">
            <div className="module-head"><h2>Admin Module</h2><button className="btn ghost" onClick={logout}>Log Out</button></div>
            <div className="metrics">
              <MetricCard label="Total customers" value={customers.length} />
              <MetricCard label="Active orders" value={activeOrders} hot />
              <MetricCard label="All orders received" value={orders.length} />
            </div>
            <h3 className="sub">Customer registry</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Joined</th><th>Orders</th></tr></thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}><td>#{customer.id}</td><td>{customer.name}</td><td>{customer.email}</td><td>{customer.joined}</td><td>{customer.orders}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {page === "user" && role === "user" && (
          <section className="view active">
            <div className="module-head"><h2>Today's menu</h2><button className="btn ghost" onClick={logout}>Log Out</button></div>
            <div className="grid">{MENU.map((item) => <FoodCard key={item.id} item={item} onAdd={addToCart} />)}</div>
          </section>
        )}

        {page === "manager" && role === "manager" && (
          <section className="view active">
            <div className="module-head"><h2>Manager Module</h2><button className="btn ghost" onClick={logout}>Log Out</button></div>
            <h3 className="sub">Add order</h3>
            <form className="form-row glass" onSubmit={createOrder}>
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" aria-label="Customer name" />
              <input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Item" aria-label="Item" />
              <input value={newPrice} onChange={(e) => setNewPrice(e.target.value)} type="number" min="0" step="0.01" placeholder="Price" aria-label="Price" />
              <button className="btn primary" type="submit">Add Order</button>
            </form>
            <p className={`form-msg ${managerMessage.includes("added") ? "good" : ""}`}>{managerMessage}</p>
            <h3 className="sub">Order pipeline</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {orders.length === 0 ? <tr><td colSpan="6" className="empty">No orders yet.</td></tr> : orders.map((order) => {
                    const rejected = order.decision === "Rejected";
                    const label = rejected ? "Rejected" : order.status;
                    return (
                      <tr key={order.id}>
                        <td>#{order.id}</td><td>{order.customer}</td><td>{order.items}</td><td>{money(order.total)}</td>
                        <td><span className={`pill ${label.replace(/ /g, "-")}`}>{label}</span></td>
                        <td><div className="actions">
                          <button className="btn ok small" disabled={rejected || order.decision === "Accepted"} onClick={() => acceptOrder(order)}>Accept</button>
                          <button className="btn bad small" disabled={rejected || order.status === "Delivered"} onClick={() => updateOrder(order.id, { decision: "Rejected" })}>Reject</button>
                          <select aria-label={`Update status for order ${order.id}`} value={order.status} disabled={rejected} onChange={(e) => updateOrder(order.id, { status: e.target.value })}>
                            {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                          </select>
                        </div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {page === "restaurants" && (
          <section className="view active">
            <h2>Partner restaurants</h2>
            <div className="grid">
              {RESTAURANTS.map((restaurant) => (
                <article className="card" key={restaurant.name}>
                  <div className="card-art">{restaurant.emoji}</div>
                  <div className="card-body"><h3>{restaurant.name}</h3><p>{restaurant.cuisine}</p>
                    <div className="card-foot"><span className="rating">★ {restaurant.rating}</span><span>{restaurant.eta}</span></div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {page === "offers" && (
          <section className="view active">
            <h2>Exclusive vouchers</h2>
            <div className="grid">
              {OFFERS.map((offer) => (
                <article className="card voucher" key={offer.code}>
                  <div className="card-body"><span className={`role-tag ${offer.role}`}>{offer.role}</span><h3>{offer.title}</h3><p>{offer.desc}</p>
                    <div className="card-foot"><span className="code">{offer.code}</span>
                      {offer.type !== "info" && <button className="btn small" onClick={() => applyOffer(offer.code)}>Apply</button>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {page === "cart" && (
          <section className="view active">
            <h2>Your cart</h2>
            <div className="cart-layout">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Item</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead>
                  <tbody>
                    {cart.length ? cart.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td><td>{money(item.price)}</td>
                        <td><span className="qty"><button onClick={() => changeQuantity(item.id, -1)} aria-label="Decrease quantity">−</button>{item.qty}<button onClick={() => changeQuantity(item.id, 1)} aria-label="Increase quantity">+</button></span></td>
                        <td>{money(item.price * item.qty)}</td><td><button className="btn small" onClick={() => removeFromCart(item.id)}>Remove</button></td>
                      </tr>
                    )) : <tr><td colSpan="5" className="empty">Your cart is empty. Sign in to the User Module to add food.</td></tr>}
                  </tbody>
                </table>
              </div>
              <aside className="summary glass">
                <div className="line"><span>Items</span><span>{cartCount}</span></div>
                <div className="line"><span>Subtotal</span><span>{money(subtotal)}</span></div>
                <div className="line"><span>Delivery fee</span><span>{subtotal > 0 && deliveryFee === 0 ? "Free" : money(deliveryFee)}</span></div>
                <div className="line"><span>Voucher</span><span>−{money(discount)}</span></div>
                <div className="line total"><span>Total</span><span>{money(total)}</span></div>
                <button className="btn primary block" disabled={!cart.length} onClick={placeOrder}>Place Order</button>
                <p className="form-msg good">{cartMessage}</p>
                {appliedCode && <p className="muted">Applied code: {appliedCode}</p>}
              </aside>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand"><span className="wordmark static">Foody</span><span className="muted">Food delivery, handled.</span></div>
          <div className="footer-team"><span className="muted">Designed and developed by the</span><strong className="team-name">Harsha</strong><span className="muted">development team</span></div>
        </div>
        <p className="copy">© 2026 Harsha. All rights reserved. · <a className="repo-link" href="https://github.com/harsha-team/foody-food-delivery" target="_blank" rel="noreferrer">Git repository</a></p>
      </footer>

      {loginTarget && (
        <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) closeLogin(); }}>
          <form className="modal" onSubmit={handleLogin} role="dialog" aria-modal="true" aria-labelledby="loginTitle" autoComplete="off">
            <div className="modal-icon">{({ admin: "🛡️", user: "🍽️", manager: "👨‍🍳" })[loginTarget]}</div>
            <h2 id="loginTitle">{ACCOUNTS[loginTarget].label} sign in</h2>
            <p className="muted">Demo credentials: {ACCOUNTS[loginTarget].username} / {ACCOUNTS[loginTarget].password}</p>
            <label htmlFor="lUser">Username</label>
            <input id="lUser" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <label htmlFor="lPass">Password</label>
            <input id="lPass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {loginError && <p className="form-msg">{loginError}</p>}
            <div className="modal-actions">
              <button type="button" className="btn ghost" onClick={closeLogin}>Cancel</button>
              <button type="submit" className="btn primary">Sign In</button>
            </div>
          </form>
        </div>
      )}

      {toast && <div className="toast show" role="status">{toast}</div>}
    </div>
  );
}

export default App;
