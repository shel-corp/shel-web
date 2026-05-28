export default function StatusLine({ children, className = '' }) {
  return <p className={`status ${className}`.trim()}>{children}</p>;
}
