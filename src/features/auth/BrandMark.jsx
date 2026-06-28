const LOGO_URL = "https://difz6g2sivtgc.cloudfront.net//media/logo.webp?format=auto&width=300";

export default function BrandMark({ compact = false }) {
  return (
    <a className="auth-brand" href="/" aria-label="Luyện Nói">
      <img
        className={compact ? "auth-brand-logo auth-brand-logo-compact" : "auth-brand-logo"}
        src={LOGO_URL}
        alt="Luyện Nói Logo"
        width="56"
        height="56"
      />
      <span>Luyện Nói</span>
      <span className="auth-brand-ball" role="img" aria-label="Quả bóng đá">
        ⚽
      </span>
    </a>
  );
}
