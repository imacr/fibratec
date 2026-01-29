export function Card({ titulo, children, className = "" }) {
  return (
    <div className={`${className} doc-card`}>
      <h3>{titulo}</h3>
      {children}
    </div>
  );
}
