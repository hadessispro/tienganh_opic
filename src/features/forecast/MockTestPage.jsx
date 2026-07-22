import { useState, useEffect, useRef } from "react";
import ForecastLayout from "./ForecastLayout";

export default function MockTestPage({ onNavigate }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [surveyPart, setSurveyPart] = useState(1); // Parts 1 to 5 of Background Survey
  
  // Step 1: Background Survey Answers
  const [surveyAnswers, setSurveyAnswers] = useState({
    jobType: "Kinh doanh / Công ty",
    currentlyWorking: "Có",
    workExperience: "Đây là việc làm đầu tiên của tôi. Tôi đã đi làm trên 2 tháng.",
    isManager: "Có",
    currentlyInSchool: "Không",
    educationLevel: "Đã hơn 5 năm từ ngày tôi lấy lớp học",
    livingSituation: "Tôi sống một mình trong một căn nhà hoặc căn hộ.",
    selectedHobbies: [],
    selectedTopics: []
  });

  // Step 2: Self Assessment
  const [selectedLevel, setSelectedLevel] = useState(3);
  const [playingLevelAudio, setPlayingLevelAudio] = useState(null);
  
  // Audio state simulations
  const [isPlayingSetupAudio, setIsPlayingSetupAudio] = useState(false);
  const [setupAudioProgress, setSetupAudioProgress] = useState(0);
  const [isPlayingSampleQuestion, setIsPlayingSampleQuestion] = useState(false);
  const [sampleQuestionProgress, setSampleQuestionProgress] = useState(0);
  
  // Step 3 Device Setup Test States
  const [isRecordingSetupCheck, setIsRecordingSetupCheck] = useState(false);
  const [setupRecordDuration, setSetupRecordDuration] = useState(0);
  const [setupRecordUrl, setSetupRecordUrl] = useState("");
  const [isPlayingSetupRecord, setIsPlayingSetupRecord] = useState(false);

  // Step 4 Sample Test States
  const [isRecordingSample, setIsRecordingSample] = useState(false);
  const [sampleDuration, setSampleDuration] = useState(0);
  const [sampleAudioUrl, setSampleAudioUrl] = useState("");
  const [isPlayingSampleRecord, setIsPlayingSampleRecord] = useState(false);

  // Step 5 Test Execution Mode (Official OPIc 15-question Exam Simulator)
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [examState, setExamState] = useState("idle"); // "idle", "listening", "thinking", "recording"
  const [playCount, setPlayCount] = useState(0); // 0, 1, 2
  const [audioProgress, setAudioProgress] = useState(0);
  const [testSeconds, setTestSeconds] = useState(0);
  const [micFillHeight, setMicFillHeight] = useState(15);
  const [testTranscripts, setTestTranscripts] = useState(Array(15).fill(""));
  const [scoreStatus, setScoreStatus] = useState("idle"); // "idle", "scoring", "scored", "error"
  const [testScore, setTestScore] = useState(null);
  const [scoreError, setScoreError] = useState("");
  const [activeTab, setActiveTab] = useState("translation");

  // Timers and references
  const audioRef = useRef(null);
  const playbarIntervalRef = useRef(null);
  const recordIntervalRef = useRef(null);
  const testTimerRef = useRef(null);
  const micIntervalRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptsRef = useRef(Array(15).fill(""));
  const examStateRef = useRef("idle");
  const recordingSecondsRef = useRef(0);

  const updateExamState = (newState) => {
    examStateRef.current = newState;
    setExamState(newState);
  };

  const mockLevelAudios = {
    1: "/audio/01. Music/OPIc_01_A_01.mp3",
    2: "/audio/01. Music/OPIc_01_A_01.mp3",
    3: "/audio/01. Music/OPIc_01_A_01.mp3",
    4: "/audio/01. Music/OPIc_01_A_01.mp3",
    5: "/audio/01. Music/OPIc_01_A_01.mp3",
    6: "/audio/01. Music/OPIc_01_A_01.mp3"
  };

  const hobbiesList = [
    "đi xem phim",
    "đi chơi ở câu lạc bộ/hộp đêm (nightclubs)",
    "đi xem kịch",
    "đi nghe ca nhạc",
    "đi viện bảo tàng",
    "đi chơi ở công viên",
    "đi cắm trại",
    "đi chơi ở biển",
    "xem các môn thể thao chuyên nghiệp",
    "xem con em của bạn chơi thể thao",
    "huấn luyện các môn thể thao",
    "chơi trò chơi một mình (bài, trò chơi video, vv)",
    "chơi trò chơi với người lớn (bài, bi-da, hộp trò chơi board games, vv)",
    "chơi trò chơi với trẻ em (bài, hộp trò chơi board games, vv)",
    "giúp con em làm bài"
  ];

  const topicsList = [
    "Vấn đề Môi trường",
    "Vấn đề Nhân quyền",
    "Nơi làm việc Toàn cầu",
    "Văn hóa và Xã hội",
    "Giao tiếp, Phương tiện liên lạc"
  ];

  const testQuestions = [
    "Tell me about your home. Where do you live and what does your home look like?",
    "Describe a typical day in your life. What do you usually do from morning till night?",
    "Tell me about a memorable trip you took. Where did you go and what made it special?",
    "What are some hobbies you enjoy in your free time?",
    "Describe your neighborhood. What do you like or dislike about it?",
    "Talk about your favorite type of music. Who is your favorite singer or composer?",
    "How do you stay healthy? Describe your exercise routine or diet.",
    "Tell me about a technology device you use daily. Why is it important to you?",
    "What was your school like when you were younger? Describe the campus or teachers.",
    "Talk about a traditional holiday in your country. How do people celebrate it?",
    "Describe a project you worked on recently at work or school.",
    "How has your city changed over the last ten years? What are the main differences?",
    "Describe a time when you had a problem while traveling. How did you resolve it?",
    "What are the major environmental issues in your country? What is being done about them?",
    "Tell me about a person who has influenced you the most. Who are they and what did they do?"
  ];

  useEffect(() => {
    return () => {
      stopAllAudios();
      clearInterval(playbarIntervalRef.current);
      clearInterval(recordIntervalRef.current);
      clearInterval(testTimerRef.current);
      clearInterval(micIntervalRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (testCompleted) {
      scoreMockTest();
    }
  }, [testCompleted]);

  const scoreMockTest = async () => {
    const details = testQuestions
      .map((q, i) => ({
        questionNumber: i + 1,
        question: q,
        answer: transcriptsRef.current[i] || ""
      }))
      .filter((d) => d.answer.trim().length > 0);

    const combined = transcriptsRef.current.filter((t) => t.trim().length > 0).join("\n\n");
    if (!combined.trim()) {
      setScoreStatus("error");
      setScoreError("Bạn chưa ghi âm câu trả lời nào suốt bài thi. AI không thể đánh giá kết quả.");
      return;
    }

    setScoreStatus("scoring");
    setScoreError("");
    try {
      const response = await fetch("/api/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transcript: combined,
          durationSeconds: recordingSecondsRef.current > 0 ? recordingSecondsRef.current : 15,
          question: "OPIc Full Diagnostic Test (15 Questions)",
          topic: "OPIc full mock exam feedback report",
          level: "Diagnostic Test",
          details: details
        })
      });

      if (!response.ok) {
        throw new Error("Không thể kết nối đến máy chủ chấm điểm AI.");
      }

      const data = await response.json();
      setTestScore({
        band: data.level || "IM1",
        overall: data.overall || 50,
        wordsPerMinute: data.wordsPerMinute || 85,
        errors: data.errors || [],
        proofread: data.proofread || combined,
        sampleUpgrade: data.sampleUpgrade || "Try expanding your sentences with personal details and compound structures."
      });
      setScoreStatus("scored");
    } catch (err) {
      console.error(err);
      setScoreStatus("error");
      setScoreError(err.message || "Quá trình chấm điểm gặp sự cố. Bạn vui lòng thử lại sau.");
    }
  };

  const renderAnnotatedTranscript = (text, errors) => {
    if (!errors || errors.length === 0) return text;
    let result = text;
    errors.forEach((err) => {
      if (err.highlightWord && result.includes(err.highlightWord)) {
        const replacement = `<span class="error-word" style="color: #ef4444; font-weight: bold; text-decoration: underline;">${err.highlightWord}</span>`;
        result = result.replace(new RegExp(`\\b${err.highlightWord}\\b`, "g"), replacement);
      }
    });
    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  const stopAllAudios = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingLevelAudio(null);
    setIsPlayingSetupAudio(false);
    setIsPlayingSampleQuestion(false);
    setIsPlayingSetupRecord(false);
    setIsPlayingSampleRecord(false);
    if (examState === "listening") {
      setExamState("idle");
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    clearInterval(playbarIntervalRef.current);
  };

  const playLevelAudio = (level) => {
    if (playingLevelAudio === level) {
      stopAllAudios();
      return;
    }
    stopAllAudios();
    
    const audioUrl = mockLevelAudios[level] || "";
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setPlayingLevelAudio(level);
    
    audio.play().catch(() => {
      console.log("Fallback TTS for level audio");
    });

    audio.onended = () => {
      setPlayingLevelAudio(null);
    };
  };

  // Step 3 Setup: Listening to Avatar audio simulation
  const toggleSetupAudio = () => {
    if (isPlayingSetupAudio) {
      stopAllAudios();
      return;
    }
    stopAllAudios();
    setIsPlayingSetupAudio(true);
    setSetupAudioProgress(0);
    
    let progress = 0;
    playbarIntervalRef.current = setInterval(() => {
      progress += 5;
      if (progress > 100) {
        setIsPlayingSetupAudio(false);
        setSetupAudioProgress(0);
        clearInterval(playbarIntervalRef.current);
      } else {
        setSetupAudioProgress(progress);
      }
    }, 200);
  };

  // Step 3 Setup: Recording simulation
  const handleSetupRecord = () => {
    if (isRecordingSetupCheck) {
      setIsRecordingSetupCheck(false);
      clearInterval(recordIntervalRef.current);
      setSetupRecordUrl("mock-setup-mic.mp3");
      return;
    }
    stopAllAudios();
    setIsRecordingSetupCheck(true);
    setSetupRecordDuration(0);
    setSetupRecordUrl("");
    const startTime = Date.now();
    recordIntervalRef.current = setInterval(() => {
      setSetupRecordDuration(Math.round((Date.now() - startTime) / 1000));
    }, 1000);
  };

  const playSetupRecord = () => {
    if (isPlayingSetupRecord) {
      setIsPlayingSetupRecord(false);
      return;
    }
    stopAllAudios();
    setIsPlayingSetupRecord(true);
    setTimeout(() => {
      setIsPlayingSetupRecord(false);
    }, 3000);
  };

  // Step 4 Sample: Play question audio simulation
  const toggleSampleQuestionAudio = () => {
    if (isPlayingSampleQuestion) {
      stopAllAudios();
      return;
    }
    stopAllAudios();
    setIsPlayingSampleQuestion(true);
    setSampleQuestionProgress(0);
    
    let progress = 0;
    playbarIntervalRef.current = setInterval(() => {
      progress += 4;
      if (progress > 100) {
        setIsPlayingSampleQuestion(false);
        setSampleQuestionProgress(0);
        clearInterval(playbarIntervalRef.current);
      } else {
        setSampleQuestionProgress(progress);
      }
    }, 200);
  };

  // Step 4 Sample: Record simulation
  const handleSampleRecord = () => {
    if (isRecordingSample) {
      setIsRecordingSample(false);
      clearInterval(recordIntervalRef.current);
      setSampleAudioUrl("mock-sample-recorded.mp3");
      return;
    }
    stopAllAudios();
    setIsRecordingSample(true);
    setSampleDuration(0);
    setSampleAudioUrl("");
    const startTime = Date.now();
    recordIntervalRef.current = setInterval(() => {
      setSampleDuration(Math.round((Date.now() - startTime) / 1000));
    }, 1000);
  };

  const playRecordedSample = () => {
    if (isPlayingSampleRecord) {
      setIsPlayingSampleRecord(false);
      return;
    }
    stopAllAudios();
    setIsPlayingSampleRecord(true);
    setTimeout(() => {
      setIsPlayingSampleRecord(false);
    }, 3000);
  };

  const getQuestionMaxDuration = (index) => {
    const qNum = index + 1;
    if ([2, 5, 8, 11].includes(qNum)) return 60; // 1 min
    if ([3, 6, 9, 12].includes(qNum)) return 90; // 1.5 min
    return 120; // 2 min
  };

  // Step 5 Test: Audio simulation
  const toggleTestQuestionAudio = () => {
    if (examState === "listening") {
      updateExamState("idle");
      clearInterval(playbarIntervalRef.current);
      setAudioProgress(0);
      return;
    }
    if (playCount >= 2) return;
    
    stopAllAudios();
    const nextPlayCount = playCount + 1;
    setPlayCount(nextPlayCount);
    updateExamState("listening");
    setAudioProgress(0);

    let progress = 0;
    const duration = 4000; // 4s question audio simulation
    const intervalTime = 100;
    const step = (intervalTime / duration) * 100;

    playbarIntervalRef.current = setInterval(() => {
      progress += step;
      if (progress >= 100) {
        setAudioProgress(100);
        clearInterval(playbarIntervalRef.current);
        
        // Transition to thinking, then recording
        updateExamState("thinking");
        setTimeout(() => {
          startTestRecording();
        }, 1000);
      } else {
        setAudioProgress(progress);
      }
    }, intervalTime);
  };

  const startTestRecording = () => {
    updateExamState("recording");
    const maxSec = getQuestionMaxDuration(currentQuestionIndex);
    setTestSeconds(maxSec);
    clearInterval(testTimerRef.current);
    clearInterval(micIntervalRef.current);

    let remaining = maxSec;
    testTimerRef.current = setInterval(() => {
      recordingSecondsRef.current += 1;
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(testTimerRef.current);
        setTestSeconds(0);
        nextTestQuestion();
      } else {
        setTestSeconds(remaining);
      }
    }, 1000);

    // Animate mic volume meter randomly to simulate audio signal
    micIntervalRef.current = setInterval(() => {
      setMicFillHeight(Math.floor(Math.random() * 65) + 15);
    }, 150);

    // Real client-side Web Speech API integration with continuous auto-restart
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (Recognition) {
      const recognition = new Recognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;

      let baseText = transcriptsRef.current[currentQuestionIndex] || "";
      
      recognition.onresult = (event) => {
        let finalText = "";
        let interimText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) finalText += `${item[0].transcript} `;
          else interimText += `${item[0].transcript} `;
        }
        if (finalText) {
          baseText = `${baseText} ${finalText}`.trim();
        }
        const fullTranscript = `${baseText} ${interimText}`.trim();
        transcriptsRef.current[currentQuestionIndex] = fullTranscript;
        setTestTranscripts(prev => {
          const updated = [...prev];
          updated[currentQuestionIndex] = fullTranscript;
          return updated;
        });
      };

      recognition.onend = () => {
        // Auto-restart recognition if learner is still in recording state so taking a breath/pause won't cut off speech!
        if (examStateRef.current === "recording") {
          try {
            recognition.start();
          } catch (err) {
            // Already active
          }
        }
      };

      recognition.onerror = (err) => {
        console.warn("Speech recognition error:", err);
      };

      try {
        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.error("Speech recognition start error:", err);
      }
    }
  };

  // Step 5 Test Simulation
  const startRealTest = () => {
    setTestStarted(true);
    setCurrentQuestionIndex(0);
    setExamState("idle");
    setPlayCount(0);
    setAudioProgress(0);
    setTestSeconds(120); // Q1 is 120s
    setMicFillHeight(15);
    setTestTranscripts(Array(15).fill(""));
    transcriptsRef.current = Array(15).fill("");
  };

  const nextTestQuestion = () => {
    clearInterval(testTimerRef.current);
    clearInterval(playbarIntervalRef.current);
    clearInterval(micIntervalRef.current);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    setAudioProgress(0);
    setPlayCount(0);
    setExamState("idle");
    setMicFillHeight(15);
    
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < testQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
      setTestSeconds(getQuestionMaxDuration(nextIndex));
    } else {
      setTestCompleted(true);
    }
  };

  // Checkbox handlers
  const handleHobbyToggle = (hobby) => {
    setSurveyAnswers(prev => {
      const isSelected = prev.selectedHobbies.includes(hobby);
      const updated = isSelected
        ? prev.selectedHobbies.filter(h => h !== hobby)
        : [...prev.selectedHobbies, hobby];
      return { ...prev, selectedHobbies: updated };
    });
  };

  const handleTopicToggle = (topic) => {
    setSurveyAnswers(prev => {
      const isSelected = prev.selectedTopics.includes(topic);
      const updated = isSelected
        ? prev.selectedTopics.filter(t => t !== topic)
        : [...prev.selectedTopics, topic];
      return { ...prev, selectedTopics: updated };
    });
  };

  // Selected topics list to display in room subtitle
  const chosenTopicsText = [
    surveyAnswers.jobType,
    ...surveyAnswers.selectedHobbies.slice(0, 2),
    ...surveyAnswers.selectedTopics.slice(0, 2)
  ].filter(Boolean).join(", ");

  return (
    <div className={`forecast-practice-page new-opic-ui mock-test-wizard-page ${testStarted && !testCompleted ? "exam-mode-active" : ""}`}>
      {/* Header Wizard Bar - Test Mode Header (No Sidebar navigation, just logo and Sign Out) */}
      <header className="forecast-practice-header">
        {testStarted && !testCompleted ? (
          <div className="forecast-practice-header-left" style={{ display: "flex", alignItems: "center" }}>
            <span style={{ color: "#000000", fontSize: "20px", fontWeight: "800", fontFamily: "'Inter', sans-serif" }}>LUYENOPIC - PHÒNG THI THỬ</span>
          </div>
        ) : (
          <div className="forecast-practice-header-left" onClick={() => onNavigate("/")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
            <svg viewBox="0 0 200 200" width="28" height="28" style={{ flexShrink: 0 }}>
              {/* Top teal shield part */}
              <path d="M 35,90 L 35,35 L 165,35 L 165,90" fill="none" stroke="#00a896" strokeWidth="16" strokeLinejoin="round" strokeLinecap="round" />
              {/* Bottom navy shield part */}
              <path d="M 35,110 L 35,155 L 85,155 L 100,175 L 115,155 L 165,155 L 165,110" fill="none" stroke="#001c46" strokeWidth="16" strokeLinejoin="round" strokeLinecap="round" />
              {/* Soundwave in middle (teal) */}
              <path d="M 25,100 L 55,100 C 65,100 70,50 80,50 C 90,50 95,150 105,150 C 115,150 120,50 130,50 C 140,50 145,100 155,100 L 175,100" fill="none" stroke="#00a896" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ color: "#001c46", fontSize: "20px", fontWeight: "800", letterSpacing: "0.5px", fontFamily: "'Inter', sans-serif" }}>LUYENOPIC</span>
          </div>
        )}
        <div className="forecast-practice-header-right">
          <button className="logout-text-btn" type="button" onClick={() => onNavigate("/")} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="mock-test-body-container">
        {/* Wizard step navigation is rendered inside content area */}
        {!testStarted && !testCompleted && (
          <div className="wizard-steps-nav-wrapper" style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <div className="wizard-steps-nav">
              <div className={`step-item ${currentStep === 1 ? "active" : ""}`} onClick={() => { stopAllAudios(); setCurrentStep(1); }}>
                <span className="step-num">Step 1</span>
                <span className="step-label">Background Survey</span>
              </div>
              <div className={`step-item ${currentStep === 2 ? "active" : ""}`} onClick={() => { stopAllAudios(); currentStep > 1 && setCurrentStep(2); }}>
                <span className="step-num">Step 2</span>
                <span className="step-label">Self Assessment</span>
              </div>
              <div className={`step-item ${currentStep === 3 ? "active" : ""}`} onClick={() => { stopAllAudios(); currentStep > 2 && setCurrentStep(3); }}>
                <span className="step-num">Step 3</span>
                <span className="step-label">Setup</span>
              </div>
              <div className={`step-item ${currentStep === 4 ? "active" : ""}`} onClick={() => { stopAllAudios(); currentStep > 3 && setCurrentStep(4); }}>
                <span className="step-num">Step 4</span>
                <span className="step-label">Sample Question</span>
              </div>
              <div className={`step-item ${currentStep === 5 ? "active" : ""}`} onClick={() => { stopAllAudios(); currentStep > 4 && setCurrentStep(5); }}>
                <span className="step-num">Step 5</span>
                <span className="step-label">Begin Test</span>
              </div>
            </div>
          </div>
        )}

        {!testStarted && !testCompleted ? (
          <div className="mock-test-wizard-card">
            
            {/* STEP 1: BACKGROUND SURVEY */}
            {currentStep === 1 && (
              <div className="wizard-step-content survey-step">
                <h1 className="wizard-heading">Thăm dò Lý lịch</h1>
                <p className="wizard-subtext">
                  Trả lời một cách chính xác nhất mà bạn có thể làm. Bài thi này sẽ dựa vào các câu trả lời của bạn.
                </p>
                <div className="section-divider"></div>
                <h3 className="part-indicator">Phần {surveyPart} trên 5</h3>

                {/* Question Part 1 */}
                {surveyPart === 1 && (
                  <div>
                    <div className="survey-question-box">
                      <h4 className="survey-question-title">Ngành nào mô tả tốt nhất công việc của bạn?</h4>
                      <div className="radio-options-list">
                        {[
                          "Kinh doanh / Công ty",
                          "Kinh doanh tại nhà",
                          "Giáo viên",
                          "Không có kinh nghiệm làm việc"
                        ].map(opt => (
                          <label key={opt} className={`radio-label-item ${surveyAnswers.jobType === opt ? "selected" : ""}`}>
                            <input
                              type="radio"
                              name="jobType"
                              value={opt}
                              checked={surveyAnswers.jobType === opt}
                              onChange={(e) => setSurveyAnswers({ ...surveyAnswers, jobType: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="survey-question-box">
                      <h4 className="survey-question-title">Hiện tại bạn có làm việc không?</h4>
                      <div className="radio-options-list inline-options">
                        {["Có", "Không"].map(opt => (
                          <label key={opt} className={`radio-label-item ${surveyAnswers.currentlyWorking === opt ? "selected" : ""}`}>
                            <input
                              type="radio"
                              name="currentlyWorking"
                              value={opt}
                              checked={surveyAnswers.currentlyWorking === opt}
                              onChange={(e) => setSurveyAnswers({ ...surveyAnswers, currentlyWorking: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="survey-question-box">
                      <h4 className="survey-question-title">Câu nào mô tả tốt nhất kinh nghiệm làm việc của bạn?</h4>
                      <div className="radio-options-list">
                        {[
                          "Đây là việc làm đầu tiên của tôi. Tôi mới đi làm dưới 2 tháng.",
                          "Đây là việc làm đầu tiên của tôi. Tôi đã đi làm trên 2 tháng.",
                          "Đây không phải là việc làm đầu tiên của tôi. Tôi đã có kinh nghiệm làm việc từ trước."
                        ].map(opt => (
                          <label key={opt} className={`radio-label-item ${surveyAnswers.workExperience === opt ? "selected" : ""}`}>
                            <input
                              type="radio"
                              name="workExperience"
                              value={opt}
                              checked={surveyAnswers.workExperience === opt}
                              onChange={(e) => setSurveyAnswers({ ...surveyAnswers, workExperience: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="survey-question-box">
                      <h4 className="survey-question-title">Bạn có phải là một viên quản lý/giám đốc giám sát việc làm của người khác không?</h4>
                      <div className="radio-options-list inline-options">
                        {["Có", "Không"].map(opt => (
                          <label key={opt} className={`radio-label-item ${surveyAnswers.isManager === opt ? "selected" : ""}`}>
                            <input
                              type="radio"
                              name="isManager"
                              value={opt}
                              checked={surveyAnswers.isManager === opt}
                              onChange={(e) => setSurveyAnswers({ ...surveyAnswers, isManager: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="wizard-footer-actions">
                      <div></div>
                      <button className="navy-cta-btn" type="button" onClick={() => setSurveyPart(2)}>
                        Tiếp theo
                      </button>
                    </div>
                  </div>
                )}

                {/* Question Part 2 */}
                {surveyPart === 2 && (
                  <div>
                    <div className="survey-question-box">
                      <h4 className="survey-question-title">Hiện tại bạn có đi học không?</h4>
                      <div className="radio-options-list">
                        {[
                          "Có, Toàn thời gian hoặc Bán thời gian (Part-time)",
                          "Không"
                        ].map(opt => (
                          <label key={opt} className={`radio-label-item ${surveyAnswers.currentlyInSchool === opt ? "selected" : ""}`}>
                            <input
                              type="radio"
                              name="currentlyInSchool"
                              value={opt}
                              checked={surveyAnswers.currentlyInSchool === opt}
                              onChange={(e) => setSurveyAnswers({ ...surveyAnswers, currentlyInSchool: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="survey-question-box">
                      <h4 className="survey-question-title">Loại nào mô tả đúng nhất trình độ học vấn của bạn?</h4>
                      <div className="radio-options-list">
                        {[
                          "Cao học hoặc Đại học để lấy bằng cấp",
                          "Tu nghiệp để nâng cao các kỹ năng chuyên môn",
                          "Lớp ngoại ngữ",
                          "Đã hơn 5 năm từ ngày tôi lấy lớp học"
                        ].map(opt => (
                          <label key={opt} className={`radio-label-item ${surveyAnswers.educationLevel === opt ? "selected" : ""}`}>
                            <input
                              type="radio"
                              name="educationLevel"
                              value={opt}
                              checked={surveyAnswers.educationLevel === opt}
                              onChange={(e) => setSurveyAnswers({ ...surveyAnswers, educationLevel: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="wizard-footer-actions">
                      <button className="white-back-btn" type="button" onClick={() => setSurveyPart(1)}>
                        Quay lại
                      </button>
                      <button className="navy-cta-btn" type="button" onClick={() => setSurveyPart(3)}>
                        Tiếp theo
                      </button>
                    </div>
                  </div>
                )}

                {/* Question Part 3 */}
                {surveyPart === 3 && (
                  <div>
                    <div className="survey-question-box">
                      <h4 className="survey-question-title">Bạn đang sống ở đâu?</h4>
                      <div className="radio-options-list">
                        {[
                          "Tôi sống một mình trong một căn nhà hoặc căn hộ.",
                          "Tôi sống với những người không thuộc gia đình trong một căn nhà hoặc căn hộ.",
                          "Tôi sống với gia đình trong một căn nhà hoặc căn hộ.",
                          "Tôi sống trong nội trú ở trường.",
                          "Tôi sống trong trại lính."
                        ].map(opt => (
                          <label key={opt} className={`radio-label-item ${surveyAnswers.livingSituation === opt ? "selected" : ""}`}>
                            <input
                              type="radio"
                              name="livingSituation"
                              value={opt}
                              checked={surveyAnswers.livingSituation === opt}
                              onChange={(e) => setSurveyAnswers({ ...surveyAnswers, livingSituation: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="wizard-footer-actions">
                      <button className="white-back-btn" type="button" onClick={() => setSurveyPart(2)}>
                        Quay lại
                      </button>
                      <button className="navy-cta-btn" type="button" onClick={() => setSurveyPart(4)}>
                        Tiếp theo
                      </button>
                    </div>
                  </div>
                )}

                {/* Question Part 4 */}
                {surveyPart === 4 && (
                  <div>
                    <div className="survey-question-box">
                      <h4 className="survey-question-title">Bạn có những sinh hoạt hoặc tiêu khiển ưa thích nào?</h4>
                      <p className="checkbox-validation-hint">
                        Vui lòng chọn ít nhất sáu (6) tiết mục từ trong phần Sinh hoạt, Thể thao, và Du lịch dưới đây. 
                        <strong> (Đã chọn {surveyAnswers.selectedHobbies.length} mục)</strong>
                      </p>
                      
                      <div className="checkbox-options-grid">
                        {hobbiesList.map(hobby => (
                          <label key={hobby} className={`checkbox-label-item ${surveyAnswers.selectedHobbies.includes(hobby) ? "selected" : ""}`}>
                            <input
                              type="checkbox"
                              checked={surveyAnswers.selectedHobbies.includes(hobby)}
                              onChange={() => handleHobbyToggle(hobby)}
                            />
                            <span>{hobby}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="wizard-footer-actions">
                      <button className="white-back-btn" type="button" onClick={() => setSurveyPart(3)}>
                        Quay lại
                      </button>
                      <button 
                        className="navy-cta-btn" 
                        type="button" 
                        disabled={surveyAnswers.selectedHobbies.length < 6}
                        onClick={() => setSurveyPart(5)}
                      >
                        Tiếp theo
                      </button>
                    </div>
                  </div>
                )}

                {/* Question Part 5 */}
                {surveyPart === 5 && (
                  <div>
                    <div className="survey-question-box">
                      <h4 className="survey-question-title">Bạn cảm thấy đề tài nào hứng thú để thảo luận?</h4>
                      <p className="checkbox-validation-hint">
                        Vui lòng chọn ít nhất ba (3) đề tài từ trong các đề tài dưới đây. 
                        <strong> (Đã chọn {surveyAnswers.selectedTopics.length} đề tài)</strong>
                      </p>
                      
                      <div className="checkbox-options-grid">
                        {topicsList.map(topic => (
                          <label key={topic} className={`checkbox-label-item ${surveyAnswers.selectedTopics.includes(topic) ? "selected" : ""}`}>
                            <input
                              type="checkbox"
                              checked={surveyAnswers.selectedTopics.includes(topic)}
                              onChange={() => handleTopicToggle(topic)}
                            />
                            <span>{topic}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="wizard-footer-actions">
                      <button className="white-back-btn" type="button" onClick={() => setSurveyPart(4)}>
                        Quay lại
                      </button>
                      <button 
                        className="navy-cta-btn" 
                        type="button" 
                        disabled={surveyAnswers.selectedTopics.length < 3}
                        onClick={() => { stopAllAudios(); setCurrentStep(2); }}
                      >
                        Hoàn tất khảo sát
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: SELF ASSESSMENT */}
            {currentStep === 2 && (
              <div className="wizard-step-content assessment-step">
                <h1 className="wizard-heading">Tự Đánh gia</h1>
                <p className="wizard-subtext">
                  Chọn câu nào mô tả đúng nhất khả năng nói English của bạn. Kiểm tra này sẽ dựa vào câu trả lời của bạn.
                </p>
                <div className="section-divider"></div>

                <div className="assessment-levels-list">
                  {[
                    { val: 1, title: "Mức độ 1", desc: "Tôi chỉ có thể nói vài chữ (ít hơn 10 chữ) bằng Tiếng Anh." },
                    { val: 2, title: "Mức độ 2", desc: "Tôi có thể nói tên những món vật căn bản, ngày trong tuần, thức ăn, áo quần, con số, v.v. Không phải lúc nào tôi cũng nói được nguyên câu hoặc hỏi những câu hỏi đơn giản." },
                    { val: 3, title: "Mức độ 3", desc: "Tôi có thể nói những câu đơn giản với một ít thông tin căn bản về bản thân mình, về công việc, những người và nơi chốn quen thuộc, và việc làm thông thường hàng ngày. Tôi có thể hỏi vài câu hỏi đơn giản." },
                    { val: 4, title: "Mức độ 4", desc: "Tôi có thể tham gia vào những đối thoại đơn giản về bản thân mình, việc quen làm hàng ngày, việc làm/việc học và sở thích. Tôi có thể nói dễ dàng một loạt câu đơn giản về các đề tài quen thuộc và những việc thông thường hàng ngày. Tôi cũng có thể đặt câu hỏi để có được những gì tôi cần." },
                    { val: 5, title: "Mức độ 5", desc: "Tôi có thể tham gia vào những đối thoại về những đề tài quen thuộc và các sinh hoạt liên quan đến nhà, việc làm/việc học, sở thích cá nhân và cộng đồng. Tôi có thể nói những câu nói dài có kết nối về những điều đã xảy ra, đang xảy ra và sẽ xảy ra. Tôi có thể giải thích khi được yêu cầu. Tôi có thể ứng phó với các tình huống thông thường, ngay cả khi gặp phải một rắc rối bất ngờ." },
                    { val: 6, title: "Mức độ 6", desc: "Tôi có thể tự tin tham gia vào bất cứ cuộc đối thoại và/hoặc thảo luận về việc làm/việc học, sở thích cá nhân và những sự kiện hiện tại. Tôi có thể phát biểu lâu dài với chi tiết về hầu hết các đề tài ở mức độ chính xác cao và sử dụng loạt từ vựng rộng lớn." }
                  ].map(lvl => (
                    <div key={lvl.val} className={`assessment-card-item ${selectedLevel === lvl.val ? "selected" : ""}`} onClick={() => setSelectedLevel(lvl.val)}>
                      <div className="assessment-selector">
                        <input
                          type="radio"
                          name="selectedLevel"
                          checked={selectedLevel === lvl.val}
                          onChange={() => setSelectedLevel(lvl.val)}
                        />
                        <div className="assessment-meta">
                          <span className="lvl-title">{lvl.title}</span>
                          <p className="lvl-desc">{lvl.desc}</p>
                        </div>
                      </div>
                      <button
                        className="play-sample-btn"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playLevelAudio(lvl.val);
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                        </svg>
                        <span>{playingLevelAudio === lvl.val ? "Đang phát..." : "Nghe mẫu"}</span>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="wizard-footer-actions">
                  <button className="white-back-btn" type="button" onClick={() => { stopAllAudios(); setCurrentStep(1); setSurveyPart(5); }}>
                    Quay lại
                  </button>
                  <button className="navy-cta-btn" type="button" onClick={() => { stopAllAudios(); setCurrentStep(3); }}>
                    Tiếp theo
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PRE-TEST SETUP */}
            {currentStep === 3 && (
              <div className="wizard-step-content setup-step-redesign">
                <h1 className="wizard-heading">Sửa soạn Thi</h1>
                
                <div className="setup-steps-diagram">
                  <div className="diagram-step active">
                    <div className="badge-circle">1</div>
                    <p>Click the <strong>Play</strong> icon (below Ava) to listen to the recording</p>
                  </div>
                  <div className="diagram-arrow">➔</div>
                  <div className="diagram-step">
                    <div className="badge-circle">2</div>
                    <p>Click <strong>Start Recording</strong> speak into your mic, and click <strong>Stop Recording</strong> when finished</p>
                  </div>
                  <div className="diagram-arrow">➔</div>
                  <div className="diagram-step">
                    <div className="badge-circle">3</div>
                    <p>Click <strong>Play Recording</strong> to make sure you can hear your voice</p>
                  </div>
                </div>

                <div className="section-divider" style={{ margin: "24px 0" }}></div>

                <div className="setup-two-columns-layout">
                  <div className="setup-avatar-card">
                    <div className="examiner-avatar-box-border">
                      <div className="avatar-placeholder-face">
                        <svg viewBox="0 0 100 100" className="avatar-svg">
                          <rect width="100" height="100" fill="#ced4da" />
                          <circle cx="50" cy="40" r="22" fill="#495057" />
                          <path d="M15,90 Q50,55 85,90" fill="#495057" />
                          <path d="M35,32 Q50,45 65,32" stroke="#ced4da" strokeWidth="4" fill="none" />
                        </svg>
                      </div>
                    </div>
                    <div className="avatar-integrated-playbar">
                      <button 
                        className={`playbar-trigger-btn ${isPlayingSetupAudio ? "playing" : ""}`}
                        onClick={toggleSetupAudio}
                        type="button"
                      >
                        {isPlayingSetupAudio ? "■" : "▶"}
                      </button>
                      <div className="playbar-progress-track">
                        <div className="playbar-progress-fill" style={{ width: `${setupAudioProgress}%` }}></div>
                      </div>
                      <div className="playbar-audio-icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="setup-instructions-card">
                    <ol className="setup-viet-instructions">
                      <li>
                        <span className="inst-num">1</span>
                        <span>Bấm Play (phía dưới hình) để nghe và điều chỉnh âm thanh.</span>
                      </li>
                      <li>
                        <span className="inst-num">2</span>
                        <span>Để thử micro của bạn, bấm nút Start Recording và nói.</span>
                      </li>
                      <li>
                        <span className="inst-num">3</span>
                        <span>Bấm nút Play Recording để chắc chắn rằng bạn có thể nghe được giọng nói của mình.</span>
                      </li>
                    </ol>
                    <p className="operator-contact-hint">Còn câu hỏi, liên hệ với người giám thị.</p>

                    <div className="setup-audio-triggers-row">
                      <button 
                        className={`setup-record-btn ${isRecordingSetupCheck ? "is-recording-pulsing" : ""}`}
                        onClick={handleSetupRecord}
                        type="button"
                      >
                        <span className="mic-red-indicator"></span>
                        {isRecordingSetupCheck ? `Stop Recording (${setupRecordDuration}s)` : "Start Recording"}
                      </button>
                      
                      <button 
                        className="setup-play-btn"
                        onClick={playSetupRecord}
                        disabled={isRecordingSetupCheck || !setupRecordUrl}
                        type="button"
                      >
                        {isPlayingSetupRecord ? "Playing..." : "Play Recording"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="wizard-footer-actions" style={{ marginTop: 32 }}>
                  <button className="white-back-btn" type="button" onClick={() => { stopAllAudios(); setCurrentStep(2); }}>
                    Quay lại
                  </button>
                  <button 
                    className="navy-cta-btn" 
                    type="button"
                    disabled={!setupRecordUrl}
                    onClick={() => { stopAllAudios(); setCurrentStep(4); }}
                  >
                    Tiếp theo
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: SAMPLE QUESTION */}
            {currentStep === 4 && (
              <div className="wizard-step-content sample-step-redesign">
                <h1 className="wizard-heading">Câu hỏi Mẫu</h1>
                <p className="wizard-subtext">
                  Đây là một câu hỏi thí dụ và sẽ không tính vào điểm thi cuối cùng của bạn
                </p>
                
                <div className="section-divider" style={{ margin: "20px 0" }}></div>
                <h3 className="sample-indicator-title">Câu hỏi 1 trong 1</h3>

                <div className="sample-layout-wrapper">
                  <div className="sample-avatar-col">
                    <div className="examiner-avatar-box-border">
                      <div className="avatar-placeholder-face">
                        <svg viewBox="0 0 100 100" className="avatar-svg">
                          <rect width="100" height="100" fill="#cbd5e1" />
                          <circle cx="50" cy="40" r="22" fill="#334155" />
                          <path d="M15,90 Q50,55 85,90" fill="#334155" />
                          <path d="M35,32 Q50,45 65,32" stroke="#cbd5e1" strokeWidth="4" fill="none" />
                        </svg>
                      </div>
                    </div>
                    <div className="avatar-integrated-playbar">
                      <button 
                        className={`playbar-trigger-btn ${isPlayingSampleQuestion ? "playing" : ""}`}
                        onClick={toggleSampleQuestionAudio}
                        type="button"
                      >
                        {isPlayingSampleQuestion ? "■" : "▶"}
                      </button>
                      <div className="playbar-progress-track">
                        <div className="playbar-progress-fill" style={{ width: `${sampleQuestionProgress}%` }}></div>
                      </div>
                      <div className="playbar-audio-icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="sample-recording-col">
                    <div className="sample-mic-feedback-box">
                      <svg viewBox="0 0 24 24" width="24" height="24" fill={isRecordingSample ? "#ef4444" : "#64748b"}>
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                      </svg>
                      <span className="mic-wave-vertical-bar"></span>
                    </div>
                  </div>

                  <div className="sample-instructions-col">
                    <div className="question-progress-indicator-box">
                      <span>Tiến trình của Câu hỏi:</span>
                      <div className="progress-number-block">1</div>
                    </div>

                    <div className="blue-warning-instruction-box">
                      <p className="title-warning">Bấm vào nút hình Nghe để nghe câu hỏi.</p>
                      <p className="body-warning">
                        Rất quan trọng! Bạn chỉ có 5 giây để nghe lại câu hỏi. Bạn chỉ được nghe lại câu hỏi MỘT LẦN trước khi bắt đầu thời hạn thu âm câu trả lời của bạn.
                      </p>
                    </div>

                    <div className="sample-recording-triggers">
                      <button 
                        className={`sample-trigger-record-btn ${isRecordingSample ? "active-recording" : ""}`}
                        onClick={handleSampleRecord}
                        type="button"
                      >
                        {isRecordingSample ? `Stop (${sampleDuration}s)` : "Start Recording"}
                      </button>
                      {sampleAudioUrl && (
                        <button 
                          className="sample-trigger-play-btn"
                          onClick={playRecordedSample}
                          disabled={isRecordingSample}
                          type="button"
                        >
                          {isPlayingSampleRecord ? "Playing..." : "Play Recording"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="wizard-footer-actions">
                  <button className="white-back-btn" type="button" onClick={() => { stopAllAudios(); setCurrentStep(3); }}>
                    Quay lại
                  </button>
                  <button 
                    className="navy-cta-btn" 
                    type="button"
                    disabled={!sampleAudioUrl}
                    onClick={() => { stopAllAudios(); setCurrentStep(5); }}
                  >
                    Tiếp theo
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: RULES BEFORE WE START (BEGIN TEST) */}
            {currentStep === 5 && (
              <div className="wizard-step-content begin-rules-step">
                <h1 className="wizard-heading text-center" style={{ color: "#2563eb", marginBottom: 32 }}>
                  Trước khi chúng ta bắt đầu...
                </h1>

                <div className="rules-four-columns-grid">
                  <div className="rule-column-item">
                    <div className="rule-icon-box">
                      <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#2563eb" strokeWidth="1.5">
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <line x1="2" y1="7" x2="22" y2="7" />
                        <path d="M18 5h.01M15 5h.01" />
                        <line x1="6" y1="12" x2="18" y2="12" strokeWidth="2" stroke="#ef4444" />
                      </svg>
                    </div>
                    <h4>Vẫn còn trên trang thử nghiệm</h4>
                    <p>Không mở bất kỳ trang hoặc chương trình nào khác trong khi đang diễn ra quá trình kiểm tra, hoặc quá trình kiểm tra sẽ đóng và bạn sẽ phải thực hiện lại từ quá trình đăng nhập.</p>
                  </div>

                  <div className="rule-column-item">
                    <div className="rule-icon-box">
                      <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#ea580c" strokeWidth="1.5">
                        <path d="M21.5 2v6h-6M21.34 8a10 10 0 1 0-.5 4.5" />
                        <line x1="2" y1="2" x2="22" y2="22" stroke="#ef4444" strokeWidth="2" />
                      </svg>
                    </div>
                    <h4>Không Làm mới hoặc Quay lại</h4>
                    <p>Nếu bạn làm mới trang hoặc nhấn vào nút Quay lại trong quá trình đánh giá, bài kiểm tra sẽ đóng và bạn sẽ phải thực hiện lại quá trình đăng nhập.</p>
                  </div>

                  <div className="rule-column-item">
                    <div className="rule-icon-box">
                      <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#16a34a" strokeWidth="1.5">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                        <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8"/>
                      </svg>
                    </div>
                    <h4>Nói</h4>
                    <p>Đối với mỗi câu hỏi hãy trả lời với nhiều chi tiết để cho thấy khả năng tuyệt vời của bạn!</p>
                  </div>

                  <div className="rule-column-item">
                    <div className="rule-icon-box">
                      <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#2563eb" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <h4>Thời gian rất quý giá</h4>
                    <p>Bạn có 30 phút để hoàn tất bài thi này. Đồng hồ sẽ bắt đầu tính giờ sau khi bạn bấm nút Begin.</p>
                  </div>
                </div>

                <div className="purple-disclaimer-box">
                  <span className="info-icon-badge">i</span>
                  <p>Nếu bạn gặp phải vấn đề kỹ thuật, đừng lo. Bạn luôn có thể đăng nhập để thi lại trong vòng 2 tiếng.</p>
                </div>

                <div className="text-center" style={{ marginTop: 40 }}>
                  <h3 className="ready-question-text">Bạn sẵn sàng chưa?</h3>
                  
                  <div className="rules-action-footer">
                    <button className="white-back-btn" type="button" onClick={() => setCurrentStep(4)}>
                      Quay lại
                    </button>
                    <button className="navy-cta-btn large-cta" type="button" onClick={startRealTest}>
                      Begin
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : testStarted && !testCompleted ? (
          /* ACTUAL MOCK TEST INTERFACE - REDESIGNED TO LOOK EXACTLY LIKE PRACTICE ROOM */
          <div className="opic-exam-container">
            {/* Top-left: Question X of 15 */}
            <div className="opic-exam-header-row">
              <span className="opic-exam-question-title">Question {currentQuestionIndex + 1} of 15</span>
            </div>

            <div className="opic-exam-main-layout">
              {/* Left Column: Eva classroom box */}
              <div className="opic-eva-box">
                <div className="opic-eva-avatar-wrapper" style={{ width: "300px", height: "280px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src="/eva-avatar.jpg" alt="Eva Virtual Examiner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                {/* Eva playbar controls */}
                <div className="opic-eva-playbar">
                  <button 
                    className="opic-eva-playbar-btn" 
                    type="button" 
                    onClick={toggleTestQuestionAudio}
                    disabled={playCount >= 2 && examState !== "listening"}
                  >
                    {examState === "listening" ? "■" : "▶"}
                  </button>
                  <div className="opic-eva-playbar-slider">
                    <div className="opic-eva-playbar-slider-fill" style={{ width: `${audioProgress}%` }}></div>
                  </div>
                </div>
                {/* Status banner under Eva */}
                <div className="opic-eva-status-banner">
                  {examState === "recording" ? "Đang ghi âm" : examState === "listening" ? "Đang phát câu hỏi" : examState === "thinking" ? "Chuẩn bị" : "Sẵn sàng (Bấm ▶ để nghe)"}
                </div>
                {examState === "recording" && (
                  <div className="opic-live-transcript-preview" style={{
                    padding: "10px",
                    background: "#f8fafc",
                    borderTop: "1px solid #cbd5e1",
                    fontSize: "13px",
                    color: "#0f172a",
                    fontWeight: "500",
                    fontStyle: "italic",
                    textAlign: "center",
                    minHeight: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {testTranscripts[currentQuestionIndex] ? `"${testTranscripts[currentQuestionIndex]}"` : "Đang nhận dạng giọng nói tiếng Anh của bạn..."}
                  </div>
                )}
              </div>

              {/* Middle Column: Vertical volume meter */}
              <div className="opic-mic-meter-col">
                <div className="opic-mic-meter-track">
                  <div className="opic-mic-meter-fill" style={{ height: `${examState === "recording" ? micFillHeight : 0}%` }}></div>
                </div>
                <div className="opic-mic-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                  </svg>
                </div>
              </div>

              {/* Right Column: Controls, play counts, timer */}
              <div className="opic-controls-col" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* 15 Question Exam Progress Indicator */}
                <div className="opic-playcount-row" style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-start" }}>
                  <span className="opic-playcount-label" style={{ marginBottom: "4px" }}>Tiến độ bài thi:</span>
                  <div className="opic-playcount-boxes" style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {Array.from({ length: 15 }, (_, i) => (
                      <div 
                        key={i} 
                        className={`opic-playcount-box ${i === currentQuestionIndex ? "active" : ""}`}
                        style={{ 
                          width: "28px", 
                          height: "24px", 
                          fontSize: "11px", 
                          background: i === currentQuestionIndex ? "#ea580c" : i < currentQuestionIndex ? "#e2e8f0" : "#ffffff",
                          color: i === currentQuestionIndex ? "#ffffff" : i < currentQuestionIndex ? "#475569" : "#64748b",
                          borderColor: i === currentQuestionIndex ? "#ea580c" : "#cbd5e1"
                        }}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>



                {/* Large horizontal status banner */}
                <div className="opic-status-banner-large">
                  {examState === "recording" ? "ĐANG GHI ÂM CÂU TRẢ LỜI" : examState === "listening" ? "ĐANG PHÁT CÂU HỎI" : examState === "thinking" ? "CHUẨN BỊ TRẢ LỜI" : "SẴN SÀNG - BẤM NÚT ▶ ĐỂ PHÁT CÂU HỎI"}
                </div>

                {/* Circular timer countdown */}
                <div className="opic-timer-wrapper">
                  <div className="opic-timer-circle">
                    <span>{formatTime(testSeconds)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom-right next button */}
            <div className="opic-exam-footer">
              <button 
                className="opic-next-btn" 
                type="button" 
                onClick={nextTestQuestion}
                disabled={examState === "listening" || examState === "thinking"}
              >
                Next &gt;
              </button>
            </div>
          </div>
        ) : (
          /* TEST COMPLETED SCREEN - DYNAMIC AI DIAGNOSTIC REPORT */
          scoreStatus === "scoring" ? (
            <div className="mock-test-wizard-card completion-card-wrapper" style={{ padding: "40px 20px", textAlign: "center" }}>
              <h1 className="completion-title" style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", fontFamily: "'Inter', sans-serif" }}>
                Đang phân tích bài thi...
              </h1>
              <p style={{ marginTop: "16px", color: "#475569", fontFamily: "'Inter', sans-serif" }}>
                Hệ thống AI DeepSeek đang đánh giá chi tiết 15 câu trả lời, phân tích lỗi sai ngữ pháp và dự đoán trình độ OPIc của bạn...
              </p>
              <div style={{ display: "flex", justifyContent: "center", marginTop: "32px" }}>
                <div className="diag-spinner" style={{
                  width: "50px",
                  height: "50px",
                  border: "5px solid #e2e8f0",
                  borderTop: "5px solid #0f172a",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}></div>
              </div>
            </div>
          ) : scoreStatus === "error" ? (
            <div className="mock-test-wizard-card completion-card-wrapper" style={{ padding: "40px", textAlign: "center" }}>
              <h1 className="completion-title" style={{ fontSize: "24px", fontWeight: "800", color: "#ef4444", fontFamily: "'Inter', sans-serif" }}>
                Không thể tự động đánh giá bài thi
              </h1>
              <p style={{ marginTop: "16px", color: "#475569", fontFamily: "'Inter', sans-serif" }}>
                {scoreError}
              </p>
              <div className="text-center" style={{ marginTop: "32px" }}>
                <button className="navy-cta-btn large-cta" type="button" onClick={() => onNavigate("/")} style={{ background: "#0f172a", color: "#ffffff", border: "none", padding: "12px 30px", borderRadius: "4px", fontWeight: "700", cursor: "pointer" }}>
                  Quay về Trang chủ
                </button>
              </div>
            </div>
          ) : scoreStatus === "scored" && testScore ? (
            <div className="mock-test-wizard-card evaluation-results-container" style={{ width: "100%", maxWidth: "100%", padding: "30px", border: "none", boxShadow: "none" }}>
              <h1 className="results-title" style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", fontFamily: "'Inter', sans-serif", marginBottom: "24px" }}>
                Kết Quả Phân Tích Bài Thi AI
              </h1>

              <div className="results-badges" style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                <div className="result-badge badge-level" style={{ borderRadius: "6px", padding: "10px 16px", fontFamily: "'Inter', sans-serif" }}>
                  <span>Dự đoán trình độ: <strong>{testScore.band}</strong></span>
                </div>

                <div className="result-badge badge-fluency" style={{ borderRadius: "6px", padding: "10px 16px", fontFamily: "'Inter', sans-serif" }}>
                  <span>
                    Độ trôi chảy trung bình: <strong>{testScore.wordsPerMinute} WPM</strong>
                  </span>
                </div>
              </div>

              {/* Horizontal Tabs */}
              <div className="results-tabs" style={{ display: "flex", borderBottom: "1px solid #cbd5e1", gap: "8px", marginBottom: "20px" }}>
                <button
                  className={activeTab === "translation" ? "active" : ""}
                  type="button"
                  onClick={() => setActiveTab("translation")}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    background: "none",
                    fontWeight: "600",
                    fontSize: "14px",
                    color: activeTab === "translation" ? "#0f172a" : "#64748b",
                    borderBottom: activeTab === "translation" ? "2px solid #0f172a" : "none",
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  Lỗi ngữ pháp & phát âm
                </button>
                <button
                  className={activeTab === "grammar" ? "active" : ""}
                  type="button"
                  onClick={() => setActiveTab("grammar")}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    background: "none",
                    fontWeight: "600",
                    fontSize: "14px",
                    color: activeTab === "grammar" ? "#0f172a" : "#64748b",
                    borderBottom: activeTab === "grammar" ? "2px solid #0f172a" : "none",
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  Bản sửa lỗi hoàn chỉnh
                </button>
                <button
                  className={activeTab === "sample" ? "active" : ""}
                  type="button"
                  onClick={() => setActiveTab("sample")}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    background: "none",
                    fontWeight: "600",
                    fontSize: "14px",
                    color: activeTab === "sample" ? "#0f172a" : "#64748b",
                    borderBottom: activeTab === "sample" ? "2px solid #0f172a" : "none",
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  Mẫu nâng cấp đề xuất
                </button>
              </div>

              {/* Tab Contents */}
              <div className="tab-content-container" style={{ background: "#f8fafc", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                {activeTab === "translation" && (
                  <div className="tab-pane-translation">
                    <div className="pane-header" style={{ fontWeight: "700", marginBottom: "12px", color: "#0f172a" }}>
                      <strong>Nội dung bài nói gốc của bạn:</strong>
                    </div>

                    <div className="transcript-box" style={{ background: "#ffffff", padding: "16px", borderRadius: "6px", border: "1px solid #e2e8f0", minHeight: "100px", lineHeight: "1.6", color: "#334155" }}>
                      {renderAnnotatedTranscript(transcriptsRef.current.filter(t => t.trim().length > 0).join("\n\n"), testScore.errors)}
                    </div>
                    <p className="transcript-hint" style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>Từ được tô đỏ là các lỗi ngữ pháp hoặc phát âm cần lưu ý.</p>

                    {/* Analysis Table */}
                    {testScore.errors && testScore.errors.length > 0 ? (
                      <div className="errors-table-container" style={{ marginTop: "24px", overflowX: "auto" }}>
                        <table className="errors-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr style={{ background: "#cbd5e1" }}>
                              <th style={{ padding: "10px", textAlign: "left", fontSize: "14px", fontWeight: "700" }}>Câu lỗi</th>
                              <th style={{ padding: "10px", textAlign: "left", fontSize: "14px", fontWeight: "700" }}>Giải thích & Cách sửa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {testScore.errors.map((err, idx) => (
                              <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                <td className="err-original" style={{ padding: "10px", color: "#ef4444", textDecoration: "line-through", fontSize: "14px" }}>
                                  {err.original}
                                </td>
                                <td className="err-explanation" style={{ padding: "10px", color: "#1e293b", fontSize: "14px" }}>
                                  {err.explanation}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="no-errors-box" style={{ marginTop: "24px", background: "#ecfdf5", color: "#065f46", padding: "16px", borderRadius: "6px", fontSize: "14px", fontWeight: "600" }}>
                        Chúc mừng! Không phát hiện lỗi lớn nào trong câu trả lời của bạn. Bạn đã hoàn thành rất tốt!
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "grammar" && (
                  <div className="tab-pane-grammar">
                    <div className="pane-header" style={{ fontWeight: "700", marginBottom: "12px", color: "#0f172a" }}>
                      <strong>Bản sửa lỗi ngữ pháp hoàn chỉnh:</strong>
                    </div>
                    <div className="transcript-box proofread-box" style={{ background: "#ffffff", padding: "16px", borderRadius: "6px", border: "1px solid #e2e8f0", minHeight: "100px", lineHeight: "1.6", color: "#1e293b" }}>
                      {testScore.proofread}
                    </div>
                    <p className="transcript-hint" style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>Đoạn văn trên đã được AI tinh chỉnh lại ngữ pháp, từ vựng và cấu trúc câu để chuyên nghiệp hơn.</p>
                  </div>
                )}

                {activeTab === "sample" && (
                  <div className="tab-pane-sample">
                    <div className="pane-header" style={{ fontWeight: "700", marginBottom: "12px", color: "#0f172a" }}>
                      <strong>Ý tưởng nâng cấp đạt band điểm cao (IH/AL):</strong>
                    </div>
                    <div className="transcript-box sample-box" style={{ background: "#ffffff", padding: "16px", borderRadius: "6px", border: "1px solid #e2e8f0", minHeight: "100px", lineHeight: "1.6", color: "#1e293b" }}>
                      {testScore.sampleUpgrade}
                    </div>
                    <p className="transcript-hint" style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>Nên mở rộng các cấu trúc mô tả bằng các trạng từ chỉ thời gian và trạng thái cảm xúc để nâng cao tính tự nhiên.</p>
                  </div>
                )}
              </div>

              <div className="results-actions" style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "32px" }}>
                <button className="navy-cta-btn large-cta" type="button" onClick={() => onNavigate("/")} style={{ background: "#0f172a", color: "#ffffff", border: "none", padding: "12px 30px", borderRadius: "4px", fontWeight: "700", cursor: "pointer" }}>
                  Quay lại Trang chủ
                </button>
              </div>
            </div>
          ) : (
            /* fallback default cards */
            <div className="mock-test-wizard-card completion-card-wrapper">
              <h1 className="completion-title">Chúc mừng!</h1>
              <h2 className="completion-subtitle">Bạn đã hoàn tất bài thi của mình.</h2>
              
              <div className="completion-two-columns-grid">
                <div className="completion-column-box">
                  <div className="completion-badge-icon check-box-orange">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#0f172a" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p>Chúng tôi đã ghi lại những câu trả lời của bạn và các chuyên gia đánh giá của chúng tôi sẽ nhanh chóng chấm điểm bài thi.</p>
                </div>

                <div className="completion-column-box">
                  <div className="completion-badge-icon smiley-face-orange">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#0f172a" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" stroke="#0f172a" />
                      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" stroke="#0f172a" />
                    </svg>
                  </div>
                  <p>Hãy thư giãn!<br/>Bạn xứng đáng để được như vậy.</p>
                </div>
              </div>

              <div className="text-center" style={{ marginTop: 48 }}>
                <button className="navy-cta-btn large-cta" type="button" onClick={() => onNavigate("/")}>
                  Quay về Trang chủ
                </button>
              </div>
            </div>
          )
        )
}
      </div>
    </div>
  );
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}
