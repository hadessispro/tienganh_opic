import {
  opicForecastParts,
  opicForecastTopics,
  opicQuestionDetails,
  opicSampleQuestion
} from "../../data/opicQuestionBank.generated";

export const forecastParts = opicForecastParts;
export const forecastTopics = opicForecastTopics;
export const sampleQuestion = opicSampleQuestion;

const partLabels = new Map(forecastParts.map((part) => [part.id, part.label]));

export function forecastPartLabel(part) {
  return partLabels.get(part) || `Part ${part}`;
}

export function questionPath(part, question) {
  return `/question-answer/${encodeURIComponent(`PART ${part}~${question}`)}`;
}

export function parseQuestionPath(path) {
  const marker = "/question-answer/PART ";
  if (!path.startsWith(marker)) {
    return {
      ...sampleQuestion,
      partLabel: forecastPartLabel(sampleQuestion.part),
      details: opicQuestionDetails[`${sampleQuestion.part}::${sampleQuestion.text}`]
    };
  }

  const rawSegment = path.slice("/question-answer/".length);
  let raw = rawSegment;
  try {
    raw = decodeURIComponent(rawSegment);
  } catch {
    raw = rawSegment;
  }

  const [partLabel, ...questionParts] = raw.split("~");
  const part = Number(partLabel.replace("PART ", "")) || 1;
  const text = questionParts.join("~") || sampleQuestion.text;
  const details = opicQuestionDetails[`${part}::${text}`];
  const topic =
    details?.topic ||
    forecastTopics[part]?.find((item) => item.questions.includes(text))?.topic ||
    sampleQuestion.topic;

  return {
    part,
    partLabel: forecastPartLabel(part),
    topic,
    text,
    details
  };
}
