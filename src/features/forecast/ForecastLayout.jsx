import AppSidebar from "../../components/AppSidebar";
import "./forecast.css";

export default function ForecastLayout({ active = "forecast", children, onNavigate }) {
  return (
    <div className="forecast-page">
      <AppSidebar active={active} onNavigate={onNavigate} />
      <main className="forecast-main">{children}</main>
    </div>
  );
}
