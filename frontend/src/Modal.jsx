export default function Modal({ onClose, children }) {
  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet">{children}</div>
    </div>
  );
}
