import { useState } from "react";

import AuthModal from "./AuthModal";
import BrandMark from "./BrandMark";
import GoogleIcon from "./GoogleIcon";
import "./auth.css";

const checks = [
  "Chấm điểm chuẩn",
  "Nâng điểm ngay lập tức",
  "Mô phỏng trải nghiệm như thi thật"
];

const pricing = [
  {
    title: "Miễn phí",
    description: "Bắt đầu từ cơ bản",
    price: "0 VNĐ",
    features: ["20 lượt chấm điểm", "Sửa lỗi và cải thiện câu trả lời", "Forecast cập nhật liên tục"]
  },
  {
    title: "Gói Xịn",
    description: "Mọi thứ bạn cần để nâng Band",
    price: "từ 90.000 VNĐ",
    featured: true,
    features: ["Nói mỏi mồm luôn", "Thi thử như thật", "Chấm chi tiết 4 tiêu chí", "Hướng dẫn cải thiện chi tiết"]
  }
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 256 256" width="1.2em" height="1.2em" aria-hidden="true">
      <path
        fill="currentColor"
        d="m224.49 136.49l-72 72a12 12 0 0 1-17-17L187 140H40a12 12 0 0 1 0-24h147l-51.49-51.52a12 12 0 0 1 17-17l72 72a12 12 0 0 1-.02 17.01"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 256 256" width="1.2em" height="1.2em" aria-hidden="true">
      <path
        fill="currentColor"
        d="m229.66 77.66l-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69L218.34 66.34a8 8 0 0 1 11.32 11.32"
      />
    </svg>
  );
}

function Hero({ onCta }) {
  return (
    <section className="auth-hero">
      <div className="auth-hero-inner">
        <div className="auth-hero-copy">
          <h1>
            Tự Học <span>IELTS Speaking 7.0+</span>
          </h1>
          <div className="auth-check-list">
            {checks.map((item) => (
              <div className="auth-check-item" key={item}>
                <span>✓</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
          <div className="auth-hero-actions">
            <button className="auth-primary-button auth-hero-button" type="button" onClick={onCta}>
              Thi thử ngay <ArrowIcon />
            </button>
            <button className="auth-outline-button" type="button" onClick={onCta}>
              <GoogleIcon />
              <span>Đăng nhập với Google</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ForecastSection({ onCta }) {
  return (
    <section className="auth-section auth-forecast-section">
      <h2>
        Luyện với bộ đề <strong>MỚI NHẤT</strong>
      </h2>
      <div className="auth-forecast-grid">
        <img
          src="https://difz6g2sivtgc.cloudfront.net//media/latest-forecast-final.png?format=auto&width=500"
          alt="IELTS Speaking Forecast"
          loading="lazy"
        />
        <button className="auth-primary-button auth-section-button" type="button" onClick={onCta}>
          Thi thử ngay <ArrowIcon />
        </button>
      </div>
    </section>
  );
}

function ScoreSection() {
  return (
    <section className="auth-section">
      <h2>
        <strong>Điểm chuẩn</strong> như thi thật
      </h2>
      <div className="auth-score-grid">
        <img
          src="https://difz6g2sivtgc.cloudfront.net//media/threads-score-img-1.png?format=auto&width=1500"
          alt="Feedback điểm IELTS Speaking"
          loading="lazy"
        />
        <img
          src="https://difz6g2sivtgc.cloudfront.net//media/threads-score-img-4.png?format=auto&width=1500"
          alt="Feedback điểm IELTS Speaking"
          loading="lazy"
        />
      </div>
    </section>
  );
}

function PricingSection({ onCta }) {
  return (
    <section className="auth-section auth-pricing-section">
      <h2>Bắt đầu miễn phí</h2>
      <div className="auth-pricing-grid">
        {pricing.map((plan) => (
          <article
            className={plan.featured ? "auth-price-card auth-price-card-featured" : "auth-price-card"}
            key={plan.title}
          >
            <h3>{plan.title}</h3>
            <p>{plan.description}</p>
            <div className="auth-price">
              {plan.price} <span>/ tháng</span>
            </div>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <CheckIcon />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className="auth-final-cta">
        <p>Hàng nghìn người dùng đang chăm chỉ luyện speaking mỗi ngày.</p>
        <span>Còn chần chừ gì nữa?</span>
        <button className="auth-primary-button auth-final-button" type="button" onClick={onCta}>
          BẮT ĐẦU MIỄN PHÍ NGAY!
        </button>
      </div>
    </section>
  );
}

export default function AuthLandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const openAuth = () => setAuthOpen(true);

  return (
    <main className="auth-page">
      <header className="auth-header">
        <BrandMark />
      </header>
      <Hero onCta={openAuth} />
      <ForecastSection onCta={openAuth} />
      <ScoreSection />
      <PricingSection onCta={openAuth} />
      <footer className="auth-footer">
        <BrandMark compact />
        <div className="auth-footer-copy">
          <p>Hàng Việt Nam-chất lượng cao.</p>
          <p>Từ năm 2022, ❤.</p>
        </div>
      </footer>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </main>
  );
}
