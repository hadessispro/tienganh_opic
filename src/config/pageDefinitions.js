export const SITE_ORIGIN = "https://luyennoi.com";

export const pageDefinitions = [
  {
    id: "home",
    file: "index.html",
    path: "/",
    aliases: ["/index.html"],
    nav: "home",
    description:
      "Tự luyện IELTS Speaking, thi thử nhanh và nhận sửa lỗi để cải thiện band speaking."
  },
  {
    id: "login",
    kind: "react",
    title: "Luyện Nói: Đăng nhập",
    path: "/utils/login",
    aliases: ["/login", "/dang-nhap", "/dang-ky", "/utils/register"],
    description:
      "Đăng nhập hoặc đăng ký Luyện Nói để tự luyện IELTS Speaking, thi thử và nhận chấm điểm."
  },
  {
    id: "thithu",
    file: "thithu.html",
    path: "/thi-thu",
    aliases: ["/thithu", "/thithu.html", "/mock-test"],
    nav: "thithu",
    description:
      "Thi thử IELTS Speaking, theo dõi lịch sử luyện tập và nhận điểm sát thi thật."
  },
  {
    id: "takeTestPart1",
    file: "take-test-part1.html",
    path: "/thi-thu/part-1",
    aliases: ["/take-test-part1", "/take-test-part1.html", "/thi-thu-part-1"],
    nav: "thithu",
    description:
      "Bài kiểm tra nhanh IELTS Speaking Part 1 với giao diện ghi âm và điều khoản dữ liệu."
  },
  {
    id: "forecast",
    kind: "react",
    title: "Luyện Nói: Luyện Forecast",
    path: "/luyen-forecast",
    aliases: ["/forecast", "/question-answer", "/question-answer.html", "/question-answer/"],
    nav: "forecast",
    description:
      "Luyện từng câu theo Forecast, xem gợi ý trả lời và bắt đầu luyện câu hỏi."
  },
  {
    id: "forecastPart1",
    kind: "react",
    title: "Luyện Nói: Forecast Part 1",
    path: "/question-answer/part1",
    aliases: ["/luyen-forecast/part-1", "/forecast/part-1"],
    nav: "forecast",
    description:
      "Danh sách câu hỏi Forecast IELTS Speaking Part 1 theo từng topic để luyện từng câu."
  },
  {
    id: "forecastPart2",
    kind: "react",
    title: "Luyện Nói: Forecast Part 2",
    path: "/question-answer/part2",
    aliases: ["/luyen-forecast/part-2", "/forecast/part-2"],
    nav: "forecast",
    description:
      "Danh sách cue card Forecast IELTS Speaking Part 2 theo chủ đề để luyện trả lời."
  },
  {
    id: "forecastPart3",
    kind: "react",
    title: "Luyện Nói: Forecast Part 3",
    path: "/question-answer/part3",
    aliases: ["/luyen-forecast/part-3", "/forecast/part-3"],
    nav: "forecast",
    description:
      "Danh sách câu hỏi thảo luận IELTS Speaking Part 3 theo Forecast và chủ đề."
  },
  {
    id: "forecastPractice",
    kind: "react",
    title: "Luyện Nói: Tập từng câu Forecast",
    path: "/luyen-forecast/practice",
    aliases: [],
    nav: "forecast",
    description:
      "Màn luyện từng câu Forecast với ghi âm, điều khoản dữ liệu và gợi ý câu mẫu."
  },
  {
    id: "vocab",
    file: "vocab.html",
    path: "/so-tu-vung",
    aliases: ["/vocab", "/vocab.html", "/tu-vung"],
    description: "Sổ từ vựng lưu các từ và cụm từ trong quá trình luyện IELTS Speaking."
  },
  {
    id: "hocSuaLoi",
    file: "hoc-sua-loi.html",
    path: "/hoc-sua-loi",
    aliases: ["/hoc-sua-loi.html", "/sua-loi"],
    description:
      "Chọn lỗi phát âm, đuôi từ hoặc ngữ pháp để luyện sửa theo từng dạng bài."
  },
  {
    id: "pronun",
    file: "pronun.html",
    path: "/pronunciation",
    aliases: ["/pronun", "/pronun.html", "/phat-am", "/alphafeature/pronun"],
    description:
      "Khóa học pronunciation cho band 0-5 Speaking, luyện IPA và trọng âm từ đơn."
  },
  {
    id: "boxing",
    file: "boxing.html",
    path: "/hoc-sua-loi/s-es",
    aliases: ["/boxing", "/boxing.html", "/luyen-s-es"],
    description: "Luyện phát âm đuôi s và es qua câu hỏi, ghi âm và xem quy tắc."
  },
  {
    id: "exerciseEd",
    file: "exercise.html",
    title: "Luyện Nói: Luyện đuôi -ed",
    path: "/hoc-sua-loi/duoi-ed",
    aliases: ["/exercise", "/exercise.html", "/luyen-ngu-phap"],
    description:
      "Luyện đọc và sửa lỗi đuôi ed trong câu IELTS Speaking."
  },
  {
    id: "exercisePresentPerfect",
    file: "exercise.html",
    title: "Luyện Nói: Hiện tại hoàn thành",
    path: "/hoc-sua-loi/hien-tai-hoan-thanh",
    aliases: ["/luyen-hien-tai-hoan-thanh"],
    description:
      "Luyện phân biệt hiện tại hoàn thành và quá khứ đơn trong câu trả lời Speaking."
  },
  {
    id: "exercisePresentContinuous",
    file: "exercise.html",
    title: "Luyện Nói: Hiện tại tiếp diễn",
    path: "/hoc-sua-loi/hien-tai-tiep-dien",
    aliases: ["/luyen-hien-tai-tiep-dien"],
    description:
      "Luyện phân biệt hiện tại tiếp diễn và hiện tại đơn trong câu trả lời Speaking."
  },
  {
    id: "exerciseFuture",
    file: "exercise.html",
    title: "Luyện Nói: Thì tương lai",
    path: "/hoc-sua-loi/tuong-lai",
    aliases: ["/luyen-thi-tuong-lai"],
    description:
      "Luyện phân biệt will và be going to để trả lời Speaking tự nhiên hơn."
  },
  {
    id: "teaching",
    file: "teaching.html",
    path: "/giao-vien",
    aliases: ["/teaching", "/teaching.html", "/teacher"],
    description: "Không gian dành cho giáo viên quản lý lớp và theo dõi học viên."
  },
  {
    id: "payment",
    file: "payment.html",
    path: "/nang-cap",
    aliases: ["/payment", "/payment.html", "/mua-xin", "/upgrade"],
    description: "Chọn gói nâng cấp Xịn cho Luyện Nói và xem quyền lợi tài khoản."
  },
  {
    id: "paymentDetail",
    file: "payment-detail.html",
    path: "/thanh-toan",
    aliases: ["/payment-detail", "/payment-detail.html", "/checkout"],
    description: "Thông tin thanh toán, mã QR mẫu và nội dung chuyển khoản nâng cấp Xịn."
  },
  {
    id: "setupMic",
    file: "setup-mic.html",
    path: "/kiem-tra-micro",
    aliases: ["/setup-mic", "/setup-mic.html", "/microphone"],
    description: "Kiểm tra microphone và hướng dẫn chuẩn bị trước khi luyện nói."
  },
  {
    id: "setVoice",
    file: "set-voice.html",
    path: "/chon-giong-doc",
    aliases: ["/set-voice", "/set-voice.html", "/voice"],
    description: "Chọn giọng đọc American hoặc British để luyện nghe và phát âm."
  },
  {
    id: "consent",
    file: "consent.html",
    path: "/dieu-khoan",
    aliases: ["/consent", "/consent.html", "/terms", "/privacy"],
    description:
      "Điều khoản sử dụng dịch vụ và lựa chọn đồng ý xử lý dữ liệu giọng nói."
  }
];

export const dynamicRouteMatchers = [
  {
    prefix: "/alphafeature/pronun/",
    pageId: "pronun",
    canonicalPath: "/pronunciation"
  },
  {
    prefix: "/question-answer/PART ",
    pageId: "forecastPractice",
    canonicalPath: "/luyen-forecast/practice"
  }
];
