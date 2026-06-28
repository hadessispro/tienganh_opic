import { useState } from "react";

import BrandMark from "../auth/BrandMark";
import { BikeIcon, HouseIcon, MicIcon, PlayIcon } from "./ForecastIcons";
import { parseQuestionPath, questionPath } from "./forecastData";

export default function ForecastPracticePage({ path, onNavigate }) {
  const question = parseQuestionPath(path);
  const [showConsent, setShowConsent] = useState(false);

  return (
    <div className="forecast-practice-page">
      <header className="forecast-practice-header">
        <button className="forecast-practice-brand" type="button" onClick={() => onNavigate("/")}>
          <BrandMark />
        </button>
        <button className="forecast-practice-logout" type="button" onClick={() => onNavigate("/utils/login")}>
          Đăng xuất
        </button>
      </header>

      <nav className="forecast-practice-breadcrumb" aria-label="Breadcrumb">
        <button type="button" onClick={() => onNavigate("/")}>
          <HouseIcon />
          <span>Trang chủ</span>
        </button>
        <span>›</span>
        <button type="button" onClick={() => onNavigate("/question-answer")}>
          <BikeIcon />
          <span>Luyện Forecast</span>
        </button>
        <span>›</span>
        <button type="button" onClick={() => onNavigate(`/question-answer/part${question.part}`)}>
          PART {question.part}
        </button>
        <span>›</span>
        <span className="forecast-practice-current">
          <button type="button" aria-label="Nghe câu hỏi">
            <PlayIcon />
          </button>
          {question.text}
        </span>
      </nav>

      <div className="forecast-practice">
        <section className="forecast-practice-card">
          <div className="forecast-practice-prompt">
            <p>
              Nhấn nút <strong>Ghi âm ngay</strong> ở dưới để trả lời câu hỏi
            </p>
          </div>
          <div className="forecast-record-bar">
            <span>&nbsp;</span>
            <button className="forecast-record" type="button" onClick={() => setShowConsent(true)}>
              <MicIcon />
              <span>Ghi âm ngay</span>
            </button>
          </div>
        </section>

        <aside className="forecast-assist">
          <div className="forecast-assist-tabs">
            <button type="button">Test</button>
            <button className="active" type="button">
              AI hỗ trợ
            </button>
            <button type="button">Bảng vàng</button>
          </div>
          <div className="forecast-answer-sample">
            <p>Đây là câu mẫu nhé</p>
            <div className="forecast-sample-card">
              <div>
                <button type="button" aria-label="Nghe câu mẫu">
                  <PlayIcon />
                </button>
                <strong>Mẫu</strong>
                <span>Gân cổ</span>
                <span>Chill</span>
              </div>
              <p>
                Yeah, I totally like my studies. I mean, it's really cool to learn new
                stuff and <strong>expand my mind</strong>. Plus, I get to meet awesome people in
                my classes. Oh for sure, I enjoy my work. It's fun to <strong>solve problems</strong>{" "}
                every day and <strong>make an impact</strong>. I love the feeling when a project
                goes well—it's super rewarding, right?
              </p>
              <small>Bôi đen cụm từ bất kỳ để dịch và lưu lại.</small>
            </div>
          </div>
          <div className="forecast-tools">
            <button type="button">Từ vựng chủ đề</button>
            <button type="button">Ghi chú - tạo câu mẫu</button>
          </div>
          <div className="forecast-pronun-box">
            <input type="text" placeholder="Nhập từ/cụm từ để luyện phát âm" />
            <button type="button">Luyện phát âm</button>
          </div>
          <button
            className="forecast-other-question"
            type="button"
            onClick={() => onNavigate(questionPath(question.part, "Do you like your job?"))}
          >
            Câu hỏi khác
          </button>
        </aside>
      </div>

      {showConsent ? (
        <div className="forecast-consent-modal" role="dialog" aria-modal="true">
          <div className="forecast-consent-box">
            <header>
              <h2>ĐIỀU KHOẢN SỬ DỤNG DỊCH VỤ</h2>
            </header>
            <div className="forecast-consent-content">
              <p>2 điểm cần nắm:</p>
              <ul>
                <li>Hệ thống cần lưu và xử lý bản ghi âm giọng nói của bạn để chấm điểm.</li>
                <li>Cho phép chúng tôi sử dụng dữ liệu giúp bạn nhận điểm chính xác hơn.</li>
              </ul>
              <div className="forecast-consent-safe">
                <span>Dữ liệu được bảo vệ và không bao giờ được bán.</span>
                <span>Bạn có thể rút lại sự đồng ý trong phần Cài đặt.</span>
              </div>
              <button type="button" className="forecast-consent-link" onClick={() => onNavigate("/dieu-khoan")}>
                Xem điều khoản đầy đủ ›
              </button>
            </div>
            <footer>
              <p>Vui lòng chọn:</p>
              <label>
                <input type="checkbox" /> Tôi đồng ý cho phép lưu trữ, xử lý dữ liệu giọng nói để sử dụng dịch vụ
              </label>
              <label>
                <input type="checkbox" /> Tôi đồng ý cho phép sử dụng dữ liệu giọng nói đã phi danh tính hóa để cải thiện AI
              </label>
              <div>
                <button type="button" onClick={() => setShowConsent(false)}>
                  Từ chối
                </button>
                <button type="button" onClick={() => setShowConsent(false)}>
                  Đồng ý
                </button>
              </div>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}
