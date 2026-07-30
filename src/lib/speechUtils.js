/**
 * Utility functions for splitting text into sentences and reading sentence-by-sentence with punctuation pauses.
 */

export function splitIntoSentences(text) {
  if (!text || typeof text !== "string") return [];
  // Match text ending with sentence-ending punctuation (. ! ?) or remaining text
  const matches = text.match(/[^.!?;\n]+[.!?;\n]+|[^.!?;\n]+$/g);
  if (!matches) return [text.trim()];
  return matches.map((s) => s.trim()).filter(Boolean);
}

export class SentenceSpeaker {
  constructor(options = {}) {
    this.pauseDuration = options.pauseDuration ?? 900; // Default 900ms pause between sentences
    this.rate = options.rate ?? 0.92;
    this.pitch = options.pitch ?? 1;
    this.lang = options.lang ?? "en-US";
    this.onSentenceChange = options.onSentenceChange || null; // (index, total) => {}
    this.onEnd = options.onEnd || null;
    this.onError = options.onError || null;

    this.currentIndex = 0;
    this.sentences = [];
    this.isPlaying = false;
    this.timerId = null;
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
