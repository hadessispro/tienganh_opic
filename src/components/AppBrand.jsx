export default function AppBrand({ className = "", style, onClick, type = "button" }) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      className={className}
      type={onClick ? type : undefined}
      onClick={onClick}
      aria-label="LUYENOPIC"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        border: "none",
        background: "transparent",
        padding: 0,
        cursor: "pointer",
        textDecoration: "none",
        ...style
      }}
    >
      <svg viewBox="0 0 200 200" width="28" height="28" style={{ flexShrink: 0 }}>
        {/* Top teal shield part */}
        <path d="M 35,90 L 35,35 L 165,35 L 165,90" fill="none" stroke="#00a896" strokeWidth="16" strokeLinejoin="round" strokeLinecap="round" />
        {/* Bottom navy shield part */}
        <path d="M 35,110 L 35,155 L 85,155 L 100,175 L 115,155 L 165,155 L 165,110" fill="none" stroke="#001c46" strokeWidth="16" strokeLinejoin="round" strokeLinecap="round" />
        {/* Soundwave in middle (teal) */}
        <path d="M 25,100 L 55,100 C 65,100 70,50 80,50 C 90,50 95,150 105,150 C 115,150 120,50 130,50 C 140,50 145,100 155,100 L 175,100" fill="none" stroke="#00a896" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ color: "#001c46", fontSize: "20px", fontWeight: "800", letterSpacing: "0.5px", fontFamily: "'Inter', sans-serif" }}>LUYENOPIC</span>
    </Component>
  );
}
