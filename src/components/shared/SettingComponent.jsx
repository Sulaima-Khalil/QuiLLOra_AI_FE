
export const SaveButton = ({ onClick, label = "Save Changes" }) => (
  <button
    onClick={onClick}
    style={{
      padding: '10px 16px',
      background: "#7c5cff",
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      cursor: 'pointer'
    }}
  >
    {label}
  </button>
);
