"use client";

import { useState } from "react";
import { BarChart3, CheckCircle2, Clock3, LoaderCircle, RotateCcw, Trophy } from "lucide-react";
import type { UIMessage } from "ai";
import type { StudyFlowTools } from "@/lib/ai/study-quiz-tool";
import type { StudyProgressAnalysis } from "@/lib/ai/study-progress-tool";
import type { StudyQuiz } from "@/lib/ai/study-quiz-tool";
import { Disclosure } from "@/components/ui/disclosure";

export type StudyFlowMessage = UIMessage<unknown, Record<string, never>, StudyFlowTools>;
type ProgressPart = Extract<StudyFlowMessage["parts"][number], { type: "tool-analyzeStudyProgress" }>;
type QuizPart = Extract<StudyFlowMessage["parts"][number], { type: "tool-createStudyQuiz" }>;

export function StudyProgressToolCard({ part }: { part: ProgressPart }) {
  if (part.state === "input-streaming") return <ToolStatus icon={<LoaderCircle className="animate-spin" size={18} aria-hidden="true" />} title="Preparing progress analysis" detail="StudyFlow AI is gathering the progress details." />;
  if (part.state === "input-available") return <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950" role="status" aria-live="polite"><div className="flex items-center gap-2 font-semibold"><Clock3 size={17} aria-hidden="true" />Analyzing study progress</div><div className="mt-3 grid grid-cols-2 gap-2 text-xs"><Detail label="Subject" value={part.input.subject} /><Detail label="Topics" value={`${part.input.completedTopics} of ${part.input.totalTopics}`} /><Detail label="Study time" value={`${part.input.hoursStudied} hours`} /></div></div>;
  if (part.state === "output-error") return <ToolErrorCard title="Progress analysis unavailable" />;
  if (part.state !== "output-available" || !isStudyProgressAnalysis(part.output)) return <ToolErrorCard title="Progress analysis unavailable" />;
  const output = part.output;
  return <div className="mt-2 min-w-0 rounded-xl border border-blue-100 bg-white p-4 shadow-sm" role="status"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">Study progress</p><h3 className="mt-1 flex items-center gap-2 text-base font-semibold text-slate-950"><BarChart3 size={18} className="text-blue-600" aria-hidden="true" />{output.subject}</h3></div><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{output.progressLevel}</span></div><div className="mt-4"><div className="mb-1.5 flex items-baseline justify-between"><span className="text-sm font-semibold text-slate-800">Completion</span><span className="text-lg font-bold text-slate-950">{output.completionPercentage}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, output.completionPercentage))}%` }} /></div></div><div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center"><Metric label="Completed" value={`${part.input.completedTopics}/${part.input.totalTopics}`} /><Metric label="Remaining" value={`${output.remainingTopics} topics`} /><Metric label="Suggested" value={`${output.recommendedHours} hrs`} /></div></div>;
}

export function StudyQuizToolCard({ part }: { part: QuizPart }) {
  if (part.state === "input-streaming") return <ToolStatus icon={<LoaderCircle className="animate-spin" size={18} aria-hidden="true" />} title="Preparing quiz" detail="StudyFlow AI is planning the questions." />;
  if (part.state === "input-available") return <ToolStatus icon={<LoaderCircle className="animate-spin" size={18} aria-hidden="true" />} title="Building your quiz" detail="The questions are being checked before they appear." />;
  if (part.state === "output-error") return <ToolErrorCard title="Quiz could not be created" />;
  if (part.state !== "output-available" || !isStudyQuiz(part.output)) return <ToolErrorCard title="Quiz could not be created" />;
  return <InteractiveQuiz quiz={part.output} />;
}

function InteractiveQuiz({ quiz }: { quiz: StudyQuiz }) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const answeredCount = Object.keys(selectedAnswers).length;
  const score = quiz.questions.filter((question) => selectedAnswers[question.id] === question.correctOptionId).length;
  const percentage = Math.round((score / quiz.questions.length) * 100);

  function submit() {
    if (answeredCount !== quiz.questions.length) {
      setValidationMessage(`Answer all ${quiz.questions.length} questions before submitting.`);
      return;
    }
    setValidationMessage("");
    setSubmitted(true);
  }

  function retake() {
    setSelectedAnswers({});
    setSubmitted(false);
    setValidationMessage("");
  }

  return <section className="mt-3 min-w-0 rounded-xl border border-[var(--line)] bg-slate-950/40 p-4 shadow-sm" aria-labelledby={`quiz-${quiz.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-300">Interactive quiz</p><h3 id={`quiz-${quiz.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`} className="mt-1 text-base font-semibold text-white">{quiz.title}</h3><p className="mt-1 text-sm text-slate-300">{quiz.topic} · {quiz.questions.length} questions</p></div>{submitted && <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-200 ring-1 ring-emerald-400/20"><Trophy size={14} aria-hidden="true" />{score}/{quiz.questions.length}</span>}</div>
    {submitted && <div className="mt-4 rounded-lg border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-100" role="status" aria-live="polite"><p className="font-semibold">Score: {score}/{quiz.questions.length} · {percentage}%</p><p className="mt-1 text-xs text-emerald-100/90">Correct: {score} · Incorrect: {quiz.questions.length - score}</p></div>}
    <div className="mt-5 space-y-5">{quiz.questions.map((question, index) => <fieldset key={question.id} className="min-w-0 rounded-lg border border-[var(--line)] bg-slate-900/40 p-3"><legend className="max-w-full px-1 text-sm font-semibold text-white">{index + 1}. {question.question}</legend><div className="mt-2 space-y-2">{question.options.map((option) => { const isSelected = selectedAnswers[question.id] === option.id; const isCorrect = submitted && option.id === question.correctOptionId; const isWrong = submitted && isSelected && !isCorrect; return <label key={option.id} className={`flex min-w-0 cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-sm focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-cyan-300 ${isCorrect ? "border-emerald-500/30 bg-emerald-500/10" : isWrong ? "border-red-500/30 bg-red-500/10" : isSelected ? "border-cyan-400/40 bg-cyan-500/10" : "border-[var(--line)] hover:bg-slate-800/60"}`}><input type="radio" name={`${question.id}-answer`} value={option.id} checked={isSelected} disabled={submitted} onChange={() => setSelectedAnswers((current) => ({ ...current, [question.id]: option.id }))} className="mt-0.5 accent-cyan-400" /><span className="min-w-0 break-words text-slate-100">{option.text}{submitted && isCorrect ? <span className="ml-2 font-semibold text-emerald-200">Correct answer</span> : null}{submitted && isWrong ? <span className="ml-2 font-semibold text-red-200">Your answer</span> : null}</span></label>; })}</div>{submitted && <div className="mt-3 border-t border-[var(--line)] pt-3 text-xs leading-5 text-slate-300"><p className="font-semibold text-white">{selectedAnswers[question.id] === question.correctOptionId ? "Correct" : "Incorrect"}. Correct answer: {question.options.find((option) => option.id === question.correctOptionId)?.text}</p>{question.explanation ? <Disclosure label="Why is this the correct answer?"><p>{question.explanation}</p></Disclosure> : null}</div>}</fieldset>)}</div>
    {validationMessage && <p className="mt-4 text-sm font-medium text-red-200" role="alert">{validationMessage}</p>}
    <div className="mt-5 flex flex-wrap items-center gap-3"><button type="button" onClick={submit} disabled={submitted} className="inline-flex h-10 items-center gap-2 rounded-md bg-cyan-400 px-4 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-500"><CheckCircle2 size={16} aria-hidden="true" />Submit quiz</button>{submitted && <button type="button" onClick={retake} className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--line)] bg-slate-900/60 px-4 text-sm font-semibold text-white hover:bg-slate-800"><RotateCcw size={16} aria-hidden="true" />Retake quiz</button>}</div>
  </section>;
}

function ToolStatus({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) { return <div className="mt-2 flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800" role="status"><span>{icon}</span><div><p className="font-semibold">{title}</p><p className="mt-0.5 text-xs text-blue-700">{detail}</p></div></div>; }
function ToolErrorCard({ title }: { title: string }) { return <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert"><p className="font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-red-800">Please try again or adjust the topic and number of questions.</p></div>; }
function Detail({ label, value }: { label: string; value: string }) { return <div className="min-w-0 rounded-md border border-amber-100 bg-white/70 px-2.5 py-2"><p className="text-amber-700">{label}</p><p className="mt-0.5 truncate font-semibold text-amber-950">{value}</p></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="min-w-0"><p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 break-words text-xs font-semibold text-slate-800">{value}</p></div>; }
function isStudyProgressAnalysis(value: unknown): value is StudyProgressAnalysis { if (!value || typeof value !== "object") return false; const result = value as Record<string, unknown>; return typeof result.subject === "string" && typeof result.completionPercentage === "number" && typeof result.remainingTopics === "number" && typeof result.progressLevel === "string" && typeof result.recommendedHours === "number"; }
function isStudyQuiz(value: unknown): value is StudyQuiz { return studyQuizLike(value); }
function studyQuizLike(value: unknown): value is StudyQuiz { if (!value || typeof value !== "object") return false; const quiz = value as StudyQuiz; return typeof quiz.title === "string" && typeof quiz.topic === "string" && Array.isArray(quiz.questions) && quiz.questions.length >= 1 && quiz.questions.length <= 10 && quiz.questions.every((question) => question && typeof question.id === "string" && typeof question.question === "string" && Array.isArray(question.options) && question.options.length === 4 && typeof question.correctOptionId === "string" && question.options.some((option) => option.id === question.correctOptionId)); }
