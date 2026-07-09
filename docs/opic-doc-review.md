# OPIC Document Review Notes

Source scan completed from:

- `OPIc web-20260629T142610Z-3-001.zip`
- `Master OPIc_MP3-20260629T142705Z-3-001.zip`
- `C:\Users\thaibao\Downloads\OPIC master file.docx`
- `C:\Users\thaibao\Downloads\OPIC master file (1).docx`

Extraction workspace:

- `C:\tmp\opic-doc-scan\extracted`
- `C:\tmp\opic-doc-scan\analysis\manifest.json`
- `C:\tmp\opic-doc-scan\analysis\texts`

## What Was Read

- `List câu hỏi.xlsx`: primary structured question bank.
- `OPIC master file.docx` and `OPIC master file (1).docx`: implementation notes for survey mapping, test structure, and AI rubric.
- ACTFL/OPIc official PDFs: examinee handbook and familiarization guide.
- IM/IH course books and discussion PDFs: content patterns, answer structures, mock-test chapters.
- PIE/AREA and role-play PDFs: answer frameworks and role-play structures.
- MP3 archive: 629 audio files organized by OPIC topic folders.

Two legacy `.doc` teacher-guide files are old Word binary files. Text extraction is not reliable on this machine without `soffice`, `antiword`, or `catdoc`, so they are marked as needing an external converter if exact content is required.

## Domain Model

OPIC question generation should be survey-driven, not IELTS Part-driven.

The master docs describe the test as:

- Required topics: work/study and housing.
- Selected survey topics: interests, sports, travel, entertainment, lifestyle.
- Unexpected/random topics: topics outside selected survey answers.
- Role-play: product/service questions, problem solving, booking, cancellation, complaint, appointment, travel, hotel, store, phone, bank, interview, fitness/doctor scenarios.

Question bank levels:

- `IL-IM`: 152 questions.
- `IH-AL`: 251 questions.
- `Role-play`: 78 role-play questions combined from IL-IM and IH-AL.

Rubric dimensions for AI scoring:

- Global Tasks and Functions.
- Context / Content.
- Text Type.
- Accuracy.

Answer frameworks:

- PIE: Point, Illustration, Explanation.
- AREA: Answer, Reason, Example, Alternative/Additional point.
- Role-play Q11: Greeting -> Context -> Asking for information -> Closing.
- Role-play Q12: Greeting -> Context -> Solving the situation -> Closing.

## Implemented In This Pass

- Generated `src/data/opicQuestionBank.generated.js` from `List câu hỏi.xlsx`.
- Replaced hardcoded forecast question data with OPIC bank data in `src/features/forecast/forecastData.js`.
- Updated React practice/list/overview text to show `Luyện OPIC`, `IL-IM`, `IH-AL`, and `Role-play`.
- Added question metadata badges on the practice page: level, category, type, topic.

## Next Suggested Implementations

- Add a real survey setup flow that selects required + chosen + unexpected topics.
- Use MP3 manifest to connect question/audio and answer/audio files.
- Add AI scoring payload schema based on the 4 rubric dimensions.
- Add answer templates for PIE/AREA and role-play structures inside the assistant panel.
