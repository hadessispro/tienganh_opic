import ForecastLayout from "./ForecastLayout";
import { TargetIcon } from "./ForecastIcons";
import { forecastParts, questionPath, sampleQuestion } from "./forecastData";

export default function ForecastOverview({ onNavigate }) {
  return (
    <ForecastLayout onNavigate={onNavigate}>
      <section className="forecast-hero">
        <div>
          <h1>Luyện OPIC</h1>
          <p>Luyện theo level, topic và role-play từ bộ tài liệu OPIC. Nhận điểm 4 tiêu chí và hướng cải thiện tức thì.</p>
        </div>
        <div className="forecast-progress" aria-label="Tiến độ luyện OPIC">
          <div className="forecast-progress-head">
            <strong>Đã nạp question bank OPIC</strong>
            <span aria-hidden="true">i</span>
          </div>
          {forecastParts.map((part) => (
            <button key={part.id} type="button" onClick={() => onNavigate(part.path)}>
              <span>{part.label}</span>
              <i />
              <small>0/{part.total}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="forecast-example">
        <div className="forecast-divider" />
        <p>Câu ví dụ</p>
        <h2>{sampleQuestion.text}</h2>
        <button
          className="forecast-primary"
          type="button"
          onClick={() => onNavigate(questionPath(sampleQuestion.part, sampleQuestion.text))}
        >
          Luyện câu này
        </button>
        <button
          className="forecast-link"
          type="button"
          onClick={() => onNavigate("/question-answer/part1")}
        >
          Câu hỏi khác
        </button>
      </section>

      <aside className="forecast-nudge">
        <div className="forecast-nudge-icon">
          <TargetIcon />
        </div>
        <div>
          <strong>Thi thử để biết level Speaking của bạn</strong>
          <p>Thi theo format OPIC để xem khả năng hiện tại của bạn.</p>
          <button type="button" onClick={() => onNavigate("/thi-thu")}>
            Thi thử Full Test
          </button>
        </div>
      </aside>
    </ForecastLayout>
  );
}
