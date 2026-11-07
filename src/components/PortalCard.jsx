export default function PortalCard({ icon, title, description, className, onClick }) {
  return (
    <button className={`portal ${className}`} onClick={onClick}>
      <span className="portal-icon">{icon}</span>
      <strong>{title}</strong>
      <span className="portal-text">{description}</span>
      <em>Sign in</em>
    </button>
  );
}
