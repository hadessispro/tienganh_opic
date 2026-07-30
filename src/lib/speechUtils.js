/**
 * Utility functions for splitting text into sentences, selecting high-quality natural voices,
 * and reading sentence-by-sentence with punctuation pauses.
 */

export function splitIntoSentences(text) {
  if (!text || typeof text !== "string") return [];
  // Match text ending with sentence-ending punctuation (. ! ? ;) or remaining text
  const matches = text.match(/[^.!?;\n]+[.!?;\n]+|[^.!?;\n]+$/g);
  if (!matches) return [text.trim()];
  return matches.map((s) => s.trim()).filter(Boolean);
}

/**
 * Returns available English voices in browser
 */
export function getAvailableVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const voices = window.speechSynthesis.getVoices() || [];
  return voices.filter((v) => v.lang && v.lang.startsWith("en"));
}

/**
 * Intelligent selector for the most natural, human-sounding English voice available in the user's browser.
 */
export function getBestEnglishVoice(genderPreference = "female") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  if (!voices || voices.length === 0) return null;

  const enVoices = voices.filter((v) => v.lang && v.lang.startsWith("en"));
  if (enVoices.length === 0) return voices[0] || null;

  // Preferred high-quality natural voices ordered by realism
  const femaleVoices = [
    "Microsoft Jenny Online (Natural)",
    "Microsoft Aria Online (Natural)",
    "Microsoft Ana Online (Natural)",
    "Google US English",
    "Google UK English Female",
    "Samantha",
    "Karen",
    "Moira",
    "Fiona",
    "Victoria",
    "Zira"
  ];

  const maleVoices = [
    "Microsoft Guy Online (Natural)",
    "Microsoft Christopher Online (Natural)",
    "Google UK English Male",
    "Daniel",
    "Alex",
    "Fred",
    "David"
  ];

  const preferredList = genderPreference === "male" ? [...maleVoices, ...femaleVoices] : [...femaleVoices, ...maleVoices];

  for (const name of preferredList) {
    const match = enVoices.find((v) => v.name.includes(name) || v.name === name);
    if (match) return match;
  }

  // Look for any voice with 'natural' in the name
  const naturalMatch = enVoices.find((v) => v.name.toLowerCase().includes("natural"));
  if (naturalMatch) return naturalMatch;

  // Look for any Google voice
  const googleMatch = enVoices.find((v) => v.name.toLowerCase().includes("google"));
  if (googleMatch) return googleMatch;

  // Default to en-US voice
  const enUsMatch = enVoices.find((v) => v.lang === "en-US");
  if (enUsMatch) return enUsMatch;

  return enVoices[0];
}

export class SentenceSpeaker {
  constructor(options = {}) {
    this.pauseDuration = options.pauseDuration ?? 900; // Default 900ms pause between sentences
    this.rate = options.rate ?? 0.90;
    this.pitch = options.pitch ?? 1.0;
    this.lang = options.lang ?? "en-US";
    this.genderPreference = options.genderPreference || "female";
    this.onSentenceChange = options.onSentenceChange || null; // (index, total) => {}
    this.onEnd = options.onEnd || null;
    this.onError = options.onError || null;

    this.currentIndex = 0;
    this.sentences = [];
    this.isPlaying = false;
    this.timerId = null;

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Refresh voices cache when ready
        this.getVoice();
      };
    }
  }

  getVoice() {
    return getBestEnglishVoice(this.genderPreference);
  }

  speak(text, customPause) {
    this.stop();
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (this.onError) this.onError("Speech synthesis not supported");
      return;
    }

    if (customPause !== undefined) {
      this.pauseDuration = customPause;
    }

    this.sentences = splitIntoSentences(text);
    if (this.sentences.length === 0) return;

    this.currentIndex = 0;
    this.isPlaying = true;
    this._speakCurrentSentence();
  }

  speakSingleSentence(sentenceText, index = -1) {
    this.stop();
    if (!sentenceText || typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    this.isPlaying = true;
    if (this.onSentenceChange) {
      this.onSentenceChange(index, 1);
    }

    const utterance = new SpeechSynthesisUtterance(sentenceText);
    utterance.lang = this.lang;
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    const voice = this.getVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      this.isPlaying = false;
      if (this.onSentenceChange) this.onSentenceChange(-1, 0);
      if (this.onEnd) this.onEnd();
    };

    utterance.onerror = (e) => {
      this.isPlaying = false;
      if (this.onSentenceChange) this.onSentenceChange(-1, 0);
      if (this.onError) this.onError(e);
    };

    window.speechSynthesis.speak(utterance);
  }

  _speakCurrentSentence() {
    if (!this.isPlaying || this.currentIndex >= this.sentences.length) {
      this.isPlaying = false;
      if (this.onSentenceChange) this.onSentenceChange(-1, this.sentences.length);
      if (this.onEnd) this.onEnd();
      return;
    }

    const currentText = this.sentences[this.currentIndex];
    if (this.onSentenceChange) {
      this.onSentenceChange(this.currentIndex, this.sentences.length);
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(currentText);
    utterance.lang = this.lang;
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    const voice = this.getVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      if (!this.isPlaying) return;
      this.currentIndex += 1;
      if (this.currentIndex < this.sentences.length) {
        // Pause between sentences according to punctuation pause setting
        this.timerId = setTimeout(() => {
          this._speakCurrentSentence();
        }, this.pauseDuration);
      } else {
        this.isPlaying = false;
        if (this.onSentenceChange) this.onSentenceChange(-1, this.sentences.length);
        if (this.onEnd) this.onEnd();
      }
    };

    utterance.onerror = (err) => {
      if (!this.isPlaying) return;
      this.currentIndex += 1;
      this._speakCurrentSentence();
    };

    window.speechSynthesis.speak(utterance);
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (this.onSentenceChange) {
      this.onSentenceChange(-1, 0);
    }
  }
}
