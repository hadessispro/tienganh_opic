import { useMemo, useState } from "react";

import ForecastLayout from "./ForecastLayout";
import { PlayIcon, SearchIcon } from "./ForecastIcons";
import { forecastPartLabel, forecastParts, forecastTopics, questionPath } from "./forecastData";

export default function ForecastPartPage({ part = 1, onNavigate }) {
  const [query, setQuery] = useState("");
  const topics = forecastTopics[part] || forecastTopics[1];
  const currentLabel = forecastPartLabel(part);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleTopics = useMemo(() => {
    if (!normalizedQuery) return topics;
    return topics
      .map((topic) => ({
        ...topic,
        questions: topic.questions.filter(
          (question) =>
            question.toLowerCase().includes(normalizedQuery) ||
            topic.topic.toLowerCase().includes(normalizedQuery)
        )
      }))
      .filter((topic) => topic.questions.length > 0);
  }, [normalizedQuery, topics]);

  return (
    <ForecastLayout onNavigate={onNavigate}>
      <div className="forecast-list-page">
        <header className="forecast-toolbar">
          <div className="forecast-tabs" role="tablist" aria-label="Chọn level OPIC">
            {forecastParts.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === part ? "active" : ""}
                onClick={() => onNavigate(item.path)}
              >
                <span>Luyện</span> {item.label}
              </button>
            ))}
            <button type="button" onClick={() => onNavigate("/utils/login")}>
              <span>Câu</span> Bạn thêm
            </button>
          </div>
          <label className="forecast-search">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm câu hỏi"
            />
            <SearchIcon />
          </label>
        </header>

        <div className="forecast-topic-shell">
          <aside className="forecast-topic-nav">
            <div>Chọn topic {currentLabel}</div>
            {topics.map((topic) => (
              <a key={topic.topic} href={`#${topic.topic.replace(/\W+/g, "")}`}>
                {topic.topic}
              </a>
            ))}
          </aside>
          <section className="forecast-topic-list">
            {visibleTopics.map((topic) => (
              <article
                className="forecast-topic-section"
                id={topic.topic.replace(/\W+/g, "")}
                key={topic.topic}
              >
                <h1>{topic.topic}</h1>
                <div className="forecast-question-grid">
                  {topic.questions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      className="forecast-question-card"
                      onClick={() => onNavigate(questionPath(part, question))}
                    >
                      {question}
                    </button>
                  ))}
                </div>
                <button
                  className="forecast-topic-practice"
                  type="button"
                  onClick={() => onNavigate(questionPath(part, topic.questions[0]))}
                >
                  <PlayIcon />
                  <span>Luyện topic này</span>
                </button>
              </article>
            ))}
            {visibleTopics.length === 0 ? (
              <p className="forecast-empty">Không tìm thấy câu hỏi phù hợp.</p>
            ) : null}
            <div className="forecast-end">Hết câu hỏi OPIC</div>
            <div className="forecast-old">
              <h2>Câu đã làm nhưng chưa nằm trong bộ OPIC hiện tại</h2>
              <p>Không có câu nào.</p>
            </div>
          </section>
        </div>
      </div>
    </ForecastLayout>
  );
}
