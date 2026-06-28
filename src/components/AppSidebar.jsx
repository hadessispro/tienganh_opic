const navItems = [
  { id: "home", label: "Trang chủ", path: "/", icon: "⌂" },
  { id: "thithu", label: "Thi thử", path: "/thi-thu", icon: "▤" },
  { id: "forecast", label: "Luyện Forecast", path: "/luyen-forecast", icon: "⛗" }
];

export default function AppSidebar({ active = "forecast", onNavigate }) {
  return (
    <aside className="app-sidebar">
      <button className="app-sidebar-brand" type="button" onClick={() => onNavigate("/")}>
        <span className="app-sidebar-logo" aria-hidden="true">
          S
        </span>
        <span>Luyện Nói</span>
        <span className="app-sidebar-ball" aria-label="Quả bóng đá" role="img">
          ⚽
        </span>
      </button>

      <nav className="app-sidebar-nav" aria-label="Chính">
        {navItems.map((item) => {
          return (
            <button
              key={item.id}
              className={item.id === active ? "active" : ""}
              type="button"
              onClick={() => onNavigate(item.path)}
            >
              <span className="app-sidebar-ico" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="app-sidebar-bottom">
        <button className="app-sidebar-buy" type="button" onClick={() => onNavigate("/nang-cap")}>
          Mua Xịn
        </button>
        <button
          className="app-sidebar-logout"
          type="button"
          onClick={() => onNavigate("/utils/login")}
        >
          <span aria-hidden="true">↪</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
