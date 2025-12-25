import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";

export const Header = ({ handleClick, isButton, isDiscover, title, description, content }) => {
  return (
    <div className="header-wrapper">
      <div className="header-text">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      {isDiscover && (
        <div className="header-actions">
          <input type="search" placeholder="Search here" />
          <button onClick={handleClick}>
            <HiOutlineAdjustmentsHorizontal />
          </button>
        </div>
      )}

      {isButton && (
        <button 
        style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 16px",
            borderRadius: 6,
            background: "#7c5cff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            minWidth: 120,
            fontWeight: 500
          }}
         onClick={handleClick}>
          {content}
        </button>
      )}
    </div>
  );
};
