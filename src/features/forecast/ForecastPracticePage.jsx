import { useEffect, useMemo, useRef, useState } from "react";

import ForecastLayout from "./ForecastLayout";
import { BikeIcon, HouseIcon, MicIcon, PlayIcon } from "./ForecastIcons";
import { parseQuestionPath, questionPath, forecastTopics } from "./forecastData";
import { opicAudioMap } from "../../data/opicAudioMap.generated";

const topicTranslations = {
  "Work": "Công việc",
  "Housing": "Nhà ở",
  "Movies": "Xem Phim",
  "Music": "Âm nhạc",
  "Parks": "Công viên",
  "Walking": "Đi bộ",
  "Beaches": "Bãi biển",
  "Domestic trips": "Du lịch trong nước",
  "Overseas trips": "Du lịch nước ngoài",
  "Vacations at home": "Kỳ nghỉ tại nhà",
  "Bars": "Quán Bar",
  "Restaurants": "Nhà hàng",
  "Coffee shops": "Quán cà phê",
  "Gatherings": "Tụ tập",
  "Food": "Thức ăn",
  "Health": "Sức khỏe",
  "Geography": "Địa lý",
  "Furniture": "Đồ nội thất",
  "Internet": "Internet",
  "Phones": "Điện thoại",
  "Technology": "Công nghệ",
  "Shopping": "Mua sắm",
  "Fashion": "Thời trang",
  "Weather": "Thời tiết",
  "Transportation": "Giao thông",
  "Appointment": "Cuộc hẹn",
  "Holidays": "Ngày lễ",
  "Banks": "Ngân hàng",
  "Clothing stores": "Cửa hàng quần áo",
  "Food stores": "Cửa hàng thực phẩm",
  "Trips": "Chuyến đi",
  "Hotels": "Khách sạn",
  "Business trips": "Chuyến công tác",
  "Questioning": "Đặt câu hỏi",
  "Store sale": "Khuyến mãi cửa hàng",
  "Train": "Tàu hỏa",
  "Phone": "Điện thoại",
  "Recycling": "Tái chế"
};

const sampleAnswer =
  "Yeah, I totally like my studies. I mean, it's really cool to learn new stuff and expand my mind. Plus, I get to meet awesome people in my classes. Oh for sure, I enjoy my work. It's fun to solve problems every day and make an impact. I love the feeling when a project goes well, it's super rewarding, right?";

function normalizeWords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function scoreAnswer(transcript, durationSeconds, question) {
  const words = normalizeWords(transcript);
  const uniqueWords = new Set(words);
  const questionWords = new Set(normalizeWords(`${question.text} ${question.topic}`));
  const matched = words.filter((word) => questionWords.has(word)).length;
  const wordsPerMinute = durationSeconds > 0 ? (words.length / durationSeconds) * 60 : 0;
  const fillerCount = words.filter((word) => ["um", "uh", "er", "ah", "like"].includes(word)).length;
  const diversity = words.length ? uniqueWords.size / words.length : 0;

  const task = Math.min(100, Math.round(35 + words.length * 1.15 + matched * 3));
  const content = Math.min(100, Math.round(40 + matched * 6 + Math.min(words.length, 80) * 0.45));
  const textType = Math.min(100, Math.round(35 + Math.max(0, words.length - 18) * 0.9 + diversity * 20));
  const fluencyBase = wordsPerMinute >= 75 && wordsPerMinute <= 165 ? 82 : wordsPerMinute > 0 ? 62 : 45;
  const accuracy = Math.max(35, Math.min(100, Math.round(fluencyBase + diversity * 18 - fillerCount * 4)));
  const overall = Math.round(task * 0.25 + content * 0.25 + textType * 0.25 + accuracy * 0.25);

  let band = "IL";
  if (overall >= 82) band = "IH+";
  else if (overall >= 70) band = "IM3-IH";
  else if (overall >= 58) band = "IM1-IM2";

  const tips = [];
  if (words.length < 45) tips.push("Nói dài hơn một chút: mở ý bằng ví dụ cụ thể và cảm xúc cá nhân.");
  if (matched < 3) tips.push("Bám sát keyword của câu hỏi hơn để phần Context/Content rõ hơn.");
  if (textType < 65) tips.push("Nối câu bằng because, for example, another thing is để text type tự nhiên hơn.");
  if (fillerCount > 3) tips.push("Giảm filler như um/uh/like, thay bằng pause ngắn trước khi nói tiếp.");
  if (tips.length === 0) tips.push("Bài nói ổn. Lần sau thử thêm so sánh quá khứ-hiện tại hoặc một tình huống cụ thể.");

  const dynamicErrors = [];
  if (transcript.trim().length > 0) {
    if (words.length <= 12) {
      const firstWord = words[0] || transcript;
      dynamicErrors.push({
        original: transcript,
        highlightWord: firstWord,
        explanation: `Bài nói bị dở dang (chỉ mới nói được ${words.length} từ: "${transcript}"). Trong kỳ thi OPIc, bạn cần phát biểu câu dài hơn (tối thiểu 30-50 từ cho mỗi câu) có đầy đủ chủ ngữ - vị ngữ.`
      });
    } else {
      const lower = transcript.toLowerCase();
      if (lower.includes("it make ") || lower.includes("he make ") || lower.includes("she make ")) {
        dynamicErrors.push({
          original: "it make",
          highlightWord: "make",
          explanation: "Chủ ngữ ngôi thứ ba số ít (it/he/she) đi với động từ hiện tại đơn cần thêm 's' -> 'makes'."
        });
      } else {
        const firstSentence = transcript.split(/[.!?]+/)[0] || transcript;
        dynamicErrors.push({
          original: firstSentence,
          highlightWord: words[0] || "word",
          explanation: `Ý nói "${firstSentence}" của bạn đã đúng hướng. Hãy mở rộng thêm ví dụ cụ thể để nâng band OPIc.`
        });
      }
    }
  }

  return {
    provider: "local-fallback",
    overall,
    band: words.length <= 12 ? "IL (Bài nói quá ngắn)" : band,
    durationSeconds,
    wordsPerMinute: Math.round(wordsPerMinute),
    metrics: [
      ["Global Tasks", task],
      ["Context / Content", content],
      ["Text Type", textType],
      ["Accuracy", accuracy]
    ],
    tips,
    proofread: transcript,
    errors: dynamicErrors
  };
}

function normalizeBackendScore(data) {
  return {
    provider: data.provider || "ai",
    overall: Number(data.overall || 0),
    band: data.level || "IM",
    durationSeconds: 0,
    wordsPerMinute: Number(data.wordsPerMinute || 0),
    metrics: Array.isArray(data.rubric)
      ? data.rubric.map((item) => [item.name, Number(item.score || 0), item.feedback || ""])
      : [],
    tips: Array.isArray(data.improvements) ? data.improvements : [],
    strengths: Array.isArray(data.strengths) ? data.strengths : [],
    sampleUpgrade: data.sampleUpgrade || "",
    proofread: data.proofread || "",
    errors: Array.isArray(data.errors) ? data.errors : [],
    providerWarning: data.providerWarning || ""
  };
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

export default function ForecastPracticePage({ path, onNavigate }) {
  const question = parseQuestionPath(path);
  const [showConsent, setShowConsent] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [recordingState, setRecordingState] = useState("idle");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [score, setScore] = useState(null);
  const [scoreStatus, setScoreStatus] = useState("idle");
  const [scoreError, setScoreError] = useState("");
  const [recorderError, setRecorderError] = useState("");
  const [pronunText, setPronunText] = useState("");
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const chunksRef = useRef([]);
  const transcriptRef = useRef("");
  const startedAtRef = useRef(0);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;
  const recognitionSupported = useMemo(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }, []);

  const questionKey = `${question.part}::${question.text.trim()}`;
  const mappedAudio = useMemo(() => opicAudioMap[questionKey], [questionKey]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingType, setPlayingType] = useState(null);

  const [listenCount, setListenCount] = useState(2);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState("translation");

  const topicQuestions = useMemo(() => {
    if (!question.topic || !forecastTopics) return [];
    const partTopics = forecastTopics[question.part] || [];
    const topicData = partTopics.find(t => t.topic === question.topic);
    return topicData ? topicData.questions : [];
  }, [question.part, question.topic]);

  const questionIndex = useMemo(() => {
    const idx = topicQuestions.indexOf(question.text);
    return idx >= 0 ? idx + 1 : 1;
  }, [topicQuestions, question.text]);

  const totalQuestions = useMemo(() => {
    return topicQuestions.length || 3;
  }, [topicQuestions]);

  const vietnameseTopic = useMemo(() => {
    return topicTranslations[question.topic] || question.topic;
  }, [question.topic]);

  const renderAnnotatedTranscript = (text, errors) => {
    if (!text) return "";
    if (!errors || errors.length === 0) return text;

    const wordsToHighlight = errors
      .map(err => err.highlightWord?.trim())
      .filter(Boolean);

    if (wordsToHighlight.length === 0) return text;

    const sortedWords = [...new Set(wordsToHighlight)].sort((a, b) => b.length - a.length);
    const patternStr = sortedWords.map(w => `\\b${w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`).join('|');
    if (!patternStr) return text;

    const regex = new RegExp(`(${patternStr})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      const isMatch = sortedWords.some(w => w.toLowerCase() === part.toLowerCase());
      if (isMatch) {
        return (
          <span key={idx} className="highlight-err-word" title="Lỗi phát âm hoặc ngữ pháp">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const calculateMatchingReport = (learnerText, referenceText) => {
    if (!referenceText || !referenceText.trim()) {
      return { matchPercentage: 100, matchedCount: 0, targetWordCount: 0, completionLabel: "Hoàn thành" };
    }

    const learnerWords = (learnerText || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s']/g, " ")
      .split(/\s+/)
      .filter(Boolean);

    const targetWords = referenceText
      .toLowerCase()
      .replace(/[^a-z0-9\s']/g, " ")
      .split(/\s+/)
      .filter(Boolean);

    if (targetWords.length === 0) {
      return { matchPercentage: 100, matchedCount: 0, targetWordCount: 0, completionLabel: "Hoàn thành" };
    }

    const freq = {};
    learnerWords.forEach((w) => {
      freq[w] = (freq[w] || 0) + 1;
    });

    let matchedCount = 0;
    targetWords.forEach((w) => {
      if (freq[w] && freq[w] > 0) {
        freq[w] -= 1;
        matchedCount += 1;
      }
    });

    const percentage = Math.min(100, Math.round((matchedCount / targetWords.length) * 100));
    let completionLabel = "";
    if (percentage < 25) {
      completionLabel = `Mới đọc/nói ${percentage}% đoạn nghe (Chưa hoàn thành)`;
    } else if (percentage < 65) {
      completionLabel = `Hoàn thành 1 phần (${percentage}% bài nghe)`;
    } else {
      completionLabel = `Đã nói/đọc trọn vẹn (${percentage}% bài nghe)`;
    }

    return {
      matchPercentage: percentage,
      matchedCount,
      targetWordCount: targetWords.length,
      completionLabel
    };
  };

  const renderSampleMatchingDiff = (referenceText, learnerText) => {
    if (!referenceText) return null;
    const learnerWords = (learnerText || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s']/g, " ")
      .split(/\s+/)
      .filter(Boolean);

    const learnerFreq = {};
    learnerWords.forEach((w) => {
      learnerFreq[w] = (learnerFreq[w] || 0) + 1;
    });

    const tokens = referenceText.split(/(\s+)/);

    return tokens.map((token, idx) => {
      const cleanToken = token.toLowerCase().replace(/[^a-z0-9']/g, "");
      if (!cleanToken) return token;

      if (learnerFreq[cleanToken] && learnerFreq[cleanToken] > 0) {
        learnerFreq[cleanToken] -= 1;
        return (
          <span
            key={idx}
            style={{
              color: "#15803d",
              fontWeight: "700",
              background: "#dcfce7",
              padding: "1px 4px",
              borderRadius: "3px",
              margin: "0 1px"
            }}
            title="Khớp từ bài nghe mẫu"
          >
            {token}
          </span>
        );
      } else {
        return (
          <span
            key={idx}
            style={{
              color: "#94a3b8",
              textDecoration: "line-through",
              opacity: 0.6,
              margin: "0 1px"
            }}
            title="Bỏ sót / Chưa đọc đến trong bài nghe mẫu"
          >
            {token}
          </span>
        );
      }
    });
  };

  const handlePlayQuestion = () => {
    if (isPlaying && playingType === "question") {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setPlayingType(null);
      return;
    }

    if (listenCount <= 0) return;

    setListenCount(prev => prev - 1);

    if (mappedAudio?.questionAudio) {
      playUrl(mappedAudio.questionAudio, "question", question.text);
    } else {
      speak(question.text);
    }
  };

  useEffect(() => {
    return () => {
      window.clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (recognitionRef.current) recognitionRef.current.stop();
      if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  const playUrl = (url, type, fallbackText) => {
    if (!url) {
      speak(fallbackText);
      return;
    }

    if (audioRef.current) {
      const isSame = audioRef.current.src.endsWith(encodeURI(url)) || audioRef.current.src.endsWith(url);
      audioRef.current.pause();
      if (isSame && isPlaying) {
        setIsPlaying(false);
        setPlayingType(null);
        return;
      }
    }

    window.speechSynthesis.cancel();
    const audio = new Audio(url);
    audioRef.current = audio;
    setIsPlaying(true);
    setPlayingType(type);

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setPlayingType(null);
    });
    audio.addEventListener("pause", () => {
      setIsPlaying(false);
      setPlayingType(null);
    });
    audio.addEventListener("error", () => {
      setIsPlaying(false);
      setPlayingType(null);
      speak(fallbackText);
    });

    audio.play().catch(() => {
      setIsPlaying(false);
      setPlayingType(null);
      speak(fallbackText);
    });
  };

  const speak = (text) => {
    if (!speechSupported || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.92;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const beginRecognition = () => {
    if (!recognitionSupported) return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let index = 0; index < event.results.length; index += 1) {
        const item = event.results[index];
        if (item.isFinal) finalText += `${item[0].transcript} `;
        else interimText += `${item[0].transcript} `;
      }
      const nextTranscript = `${finalText}${interimText}`.trim();
      transcriptRef.current = nextTranscript;
      setTranscript(nextTranscript);
    };
    recognition.onerror = () => {
      setRecorderError("Chrome không trả transcript ổn định, nhưng bản ghi âm vẫn được lưu trong phiên này.");
    };
    recognition.start();
    recognitionRef.current = recognition;
  };

  const scoreWithBackend = async (currentTranscript, durationSeconds) => {
    if (!currentTranscript.trim()) return;

    setScoreStatus("scoring");
    setScoreError("");

    try {
      const response = await fetch("/api/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transcript: currentTranscript,
          durationSeconds,
          question: question.text,
          topic: question.topic,
          level: question.partLabel,
          details: question.details || null
        })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Không gọi được backend chấm điểm.");
      }

      setScore(normalizeBackendScore(data));
      setScoreStatus("done");
      if (data.providerWarning) setScoreError(data.providerWarning);
    } catch (error) {
      setScoreStatus("fallback");
      setScore(scoreAnswer(currentTranscript, durationSeconds, question));
      setScoreError(
        error.message ||
          "Backend AI chưa sẵn sàng, đang dùng điểm tạm từ trình duyệt."
      );
    }
  };

  const startRecording = async () => {
    setRecorderError("");
    setScore(null);
    setScoreStatus("idle");
    setScoreError("");
    setTranscript("");
    transcriptRef.current = "";
    setRecordingSeconds(0);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl("");
    }

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setRecorderError("Trình duyệt này chưa hỗ trợ ghi âm trực tiếp. Dùng Chrome/Edge mới nhất sẽ ổn nhất.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        const duration = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
        const finalTranscript = transcriptRef.current.trim();
        const localScore = scoreAnswer(finalTranscript, duration, question);
        setTranscript(finalTranscript);
        setScore(localScore);
        setRecordingState("scored");
        if (finalTranscript) {
          scoreWithBackend(finalTranscript, duration);
        } else {
          setScoreStatus("fallback");
          setScoreError("Chưa có transcript để gửi AI. Hãy nói rõ hơn hoặc dùng Chrome để bật Speech Recognition.");
        }
      };
      recorder.start();
      beginRecognition();
      startedAtRef.current = Date.now();
      setRecordingState("recording");
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds(Math.round((Date.now() - startedAtRef.current) / 1000));
      }, 500);
    } catch {
      setRecorderError("Chưa cấp quyền microphone. Cho phép mic rồi bấm ghi âm lại nhé.");
    }
  };

  const stopRecording = () => {
    window.clearInterval(timerRef.current);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
  };

  const handleRecord = () => {
    if (recordingState === "recording") {
      stopRecording();
      return;
    }
    if (!consentAccepted) {
      setShowConsent(true);
      return;
    }
    startRecording();
  };

  const acceptConsent = () => {
    setConsentAccepted(true);
    setShowConsent(false);
    startRecording();
  };

  return (
    <ForecastLayout active="forecast" onNavigate={onNavigate}>
      <div className="forecast-practice-page new-opic-ui" style={{ background: "none", minHeight: "auto", padding: 0 }}>
        {!score ? (
        <div className="practice-room-container">
          <h1 className="practice-room-title">Phòng luyện tập</h1>
          <p className="practice-room-subtitle">
            Cụm đề {vietnameseTopic} — Câu {questionIndex}/{totalQuestions}. Nghe câu hỏi từ Eva và ghi âm câu trả lời của bạn.
          </p>

          <div className="practice-cards-wrapper">
            {/* Eva Virtual Examiner Card */}
            <div className="eva-card">
              <div className="eva-avatar">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#9da4b0" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h2 className="eva-name">Eva</h2>
              <p className="eva-title">Giám khảo ảo OPIc</p>
              <button
                className="play-question-btn"
                type="button"
                onClick={handlePlayQuestion}
                disabled={listenCount <= 0 && !(isPlaying && playingType === "question")}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
                <span>
                  {isPlaying && playingType === "question" ? "Dừng nghe" : `Nghe câu hỏi (Còn ${listenCount} lần)`}
                </span>
              </button>
            </div>

            {/* Microphone Recording Card */}
            <div className="record-card">
              <button
                className={`mic-button ${recordingState === "recording" ? "is-recording" : ""}`}
                type="button"
                onClick={handleRecord}
              >
                <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                </svg>
              </button>
              <p className="mic-instruction">
                {recordingState === "recording" ? `Đang ghi âm... ${formatTime(recordingSeconds)} (Bấm để dừng)` : "Bấm vào micro để bắt đầu nói"}
              </p>

              {/* Suggestion Dropdown */}
              <div className="suggestions-container">
                {showSuggestions && (
                  <div className="suggestions-popover">
                    <div className="popover-title">Từ đệm gợi ý</div>
                    <div className="popover-tags">
                      {["Well...", "To be honest...", "You know...", "Let me think...", "Actually...", "I would say..."].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          className="tag-capsule"
                          onClick={() => {
                            setPronunText(prev => prev ? `${prev} ${tag}` : tag);
                            setShowSuggestions(false);
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  className="toggle-suggestions-btn"
                  type="button"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Gợi ý ý tưởng/Từ đệm</span>
                  <svg
                    viewBox="0 0 24 24"
                    width="12"
                    height="12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{ transform: showSuggestions ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {recorderError ? <p className="forecast-record-error">{recorderError}</p> : null}
          {scoreStatus === "scoring" ? (
            <p className="scoring-status-text">Đang gửi bài nói lên hệ thống AI để chấm điểm theo rubric OPIC...</p>
          ) : null}
        </div>
      ) : (
        <div className="evaluation-results-container">
          <h1 className="results-title">Kết quả đánh giá AI</h1>

          {(() => {
            const targetSampleText = score.sampleUpgrade || sampleAnswer;
            const currentTextSnapshot = score?.proofread || transcript;
            const matchReport = calculateMatchingReport(currentTextSnapshot, targetSampleText);
            return (
              <>
                <div className="results-badges" style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
                  <div className="result-badge badge-level">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                      <path d="M19.62 10.4a9 9 0 01-1.9 4.77l-1.12-1.13M4 12c0-4.42 3.58-8 8-8 1.95 0 3.73.7 5.12 1.86M12 20a8 8 0 008-8m-8 8a8 8 0 01-8-8"/>
                    </svg>
                    <span>Dự đoán trình độ: <strong>{matchReport.matchPercentage < 25 ? "IL (Bài nói quá ngắn)" : score.band}</strong></span>
                  </div>

                  <div className="result-badge badge-fluency">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 17h8m-8-4h8m-8-4h8M3 17l3-3 3 3 5-5"/>
                    </svg>
                    <span>
                      Độ trôi chảy: <strong>{score.wordsPerMinute} từ/phút</strong> ({score.wordsPerMinute >= 100 ? "Tốt" : score.wordsPerMinute >= 70 ? "Khá" : "Trung bình"})
                    </span>
                  </div>

                  <div
                    className="result-badge badge-matching-rate"
                    style={{
                      borderRadius: "6px",
                      padding: "10px 16px",
                      fontFamily: "'Inter', sans-serif",
                      background: matchReport.matchPercentage >= 65 ? "#f0fdf4" : "#fff7ed",
                      color: matchReport.matchPercentage >= 65 ? "#15803d" : "#c2410c",
                      border: `1px solid ${matchReport.matchPercentage >= 65 ? "#bbf7d0" : "#ffedd5"}`
                    }}
                  >
                    <span>
                      Khớp với bài nghe mẫu: <strong>{matchReport.matchPercentage}%</strong> ({matchReport.completionLabel})
                    </span>
                  </div>
                </div>

                {/* Horizontal Tabs */}
                <div className="results-tabs">
                  <button
                    className={activeTab === "translation" ? "active" : ""}
                    type="button"
                    onClick={() => setActiveTab("translation")}
                  >
                    Bản dịch & Phát âm
                  </button>
                  <button
                    className={activeTab === "grammar" ? "active" : ""}
                    type="button"
                    onClick={() => setActiveTab("grammar")}
                  >
                    Sửa lỗi ngữ pháp
                  </button>
                  <button
                    className={activeTab === "sample" ? "active" : ""}
                    type="button"
                    onClick={() => setActiveTab("sample")}
                  >
                    So sánh & Bài mẫu chuẩn IH/AL
                  </button>
                </div>

                {/* Tab Contents */}
                <div className="tab-content-container">
                  {activeTab === "translation" && (
                    <div className="tab-pane-translation">
                      <div className="pane-header">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                        </svg>
                        <strong>Bài nói của bạn</strong>
                        {audioUrl && (
                          <button
                            className="play-recording-btn"
                            type="button"
                            onClick={() => playUrl(audioUrl, "recording", "")}
                          >
                            {isPlaying && playingType === "recording" ? "Dừng nghe" : "Phát âm thanh bài nói"}
                          </button>
                        )}
                      </div>

                      <div className="transcript-box">
                        {renderAnnotatedTranscript(score?.proofread || transcript, score?.errors)}
                      </div>
                      <p className="transcript-hint">Từ được tô màu là lỗi phát âm hoặc ngữ pháp cần lưu ý.</p>

                      {/* Analysis Table */}
                      {score.errors && score.errors.length > 0 ? (
                        <div className="errors-table-container">
                          <table className="errors-table">
                            <thead>
                              <tr>
                                <th>Câu bạn đã nói</th>
                                <th>Giải thích & Cách sửa bằng tiếng Việt</th>
                              </tr>
                            </thead>
                            <tbody>
                              {score.errors.map((err, idx) => (
                                <tr key={idx}>
                                  <td className="err-original">
                                    <span className="crossed-out">{err.original}</span>
                                  </td>
                                  <td className="err-explanation">{err.explanation}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="no-errors-box">
                          Chúc mừng! Không phát hiện lỗi phát âm hoặc ngữ pháp lớn nào trong câu trả lời của bạn.
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "grammar" && (
                    <div className="tab-pane-grammar">
                      <div className="pane-header">
                        <strong>Bản sửa lỗi ngữ pháp hoàn chỉnh</strong>
                      </div>
                      <div className="transcript-box proofread-box">
                        {score.proofread || transcript}
                      </div>
                      <p className="transcript-hint">Đoạn văn trên đã được AI tinh chỉnh ngữ pháp, sửa từ vựng và tối ưu hóa cấu trúc câu nói.</p>
                    </div>
                  )}

                  {activeTab === "sample" && (
                    <div className="tab-pane-sample">
                      <div className="pane-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: "15px", color: "#0f172a" }}>Đối chiếu bài nói với đoạn nghe mẫu:</strong>
                        <button
                          className="play-sample-btn"
                          type="button"
                          onClick={() => {
                            if (mappedAudio?.answerAudios?.[0]) {
                              playUrl(mappedAudio.answerAudios[0], "sample", targetSampleText);
                            } else {
                              speak(targetSampleText);
                            }
                          }}
                        >
                          <PlayIcon /> {isPlaying && playingType === "sample" ? "Dừng nghe" : "Phát âm thanh bài nghe mẫu"}
                        </button>
                      </div>

                      {/* Matching Diff Box */}
                      <div className="transcript-box sample-matching-box" style={{ lineHeight: "1.8", fontSize: "15px", background: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                        {renderSampleMatchingDiff(targetSampleText, currentTextSnapshot)}
                      </div>

                      <div className="matching-legend" style={{ display: "flex", gap: "16px", marginTop: "10px", fontSize: "13px", color: "#475569" }}>
                        <span><strong style={{ color: "#15803d", background: "#dcfce7", padding: "2px 6px", borderRadius: "4px" }}>Màu xanh</strong> = Từ bạn đã nói khớp đúng bài nghe</span>
                        <span><strong style={{ color: "#94a3b8", textDecoration: "line-through" }}>Màu xám gạch ngang</strong> = Từ bị bỏ sót / chưa đọc đến</span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            );
          })()}

          <div className="results-actions">
            <button className="practice-again-btn" type="button" onClick={() => {
              setScore(null);
              setScoreStatus("idle");
              setTranscript("");
              setRecordingState("idle");
              setListenCount(2);
            }}>
              Luyện tập lại
            </button>
            <button className="back-home-btn" type="button" onClick={() => onNavigate("/")}>
              Quay lại trang chủ
            </button>
          </div>
        </div>
      )}

      {showConsent ? (
        <div className="forecast-consent-modal" role="dialog" aria-modal="true">
          <div className="forecast-consent-box">
            <header>
              <h2>ĐIỀU KHOẢN SỬ DỤNG DỊCH VỤ</h2>
            </header>
            <div className="forecast-consent-content">
              <p>2 điểm cần nắm:</p>
              <ul>
                <li>Hệ thống cần xử lý bản ghi âm giọng nói của bạn để chấm điểm trong phiên luyện.</li>
                <li>Không có dữ liệu nào được lưu trữ trái phép trên server trong phiên luyện tập hiện tại.</li>
              </ul>
              <div className="forecast-consent-safe">
                <span>Transcript/chấm điểm được sinh tự động và bảo mật tuyệt đối.</span>
              </div>
              <button type="button" className="forecast-consent-link" onClick={() => onNavigate("/dieu-khoan")}>
                Xem điều khoản đầy đủ ›
              </button>
            </div>
            <footer>
              <p>Vui lòng chọn:</p>
              <label>
                <input type="checkbox" defaultChecked /> Tôi đồng ý cho phép xử lý dữ liệu giọng nói để sử dụng dịch vụ
              </label>
              <label>
                <input type="checkbox" defaultChecked /> Tôi đồng ý dùng kết quả luyện tập để cải thiện trải nghiệm học
              </label>
              <div>
                <button type="button" onClick={() => setShowConsent(false)}>
                  Từ chối
                </button>
                <button type="button" onClick={acceptConsent}>
                  Đồng ý & ghi âm
                </button>
              </div>
            </footer>
          </div>
        </div>
      ) : null}
      </div>
    </ForecastLayout>
  );
}
