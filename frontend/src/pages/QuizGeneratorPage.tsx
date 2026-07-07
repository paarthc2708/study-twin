import { useEffect, useReducer, useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { ProgressBar } from '../components/ui/ProgressBar';
import { RingProgress } from '../components/charts/RingProgress';
import { RECENT_TOPICS, TOPIC_OPTIONS, computeResults, getQuestions } from '../services/quizService';
import type { Question, QuizResult } from '../types/domain';

type Difficulty = 'standard' | 'adaptive' | 'expert';

type QuizState =
  | { phase: 'selection'; topicId: string; difficulty: Difficulty; count: number }
  | { phase: 'active'; topicId: string; questions: Question[]; index: number; answers: (number | null)[]; flagged: Set<number> }
  | { phase: 'results'; result: QuizResult };

type QuizAction =
  | { type: 'SET_TOPIC'; topicId: string }
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'SET_COUNT'; count: number }
  | { type: 'START_QUIZ' }
  | { type: 'SELECT_ANSWER'; optionIndex: number }
  | { type: 'TOGGLE_FLAG' }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'FINISH' }
  | { type: 'RESET' };

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'adaptive', label: 'Adaptive AI' },
  { value: 'expert', label: 'Expert' },
];

const initialState: QuizState = { phase: 'selection', topicId: TOPIC_OPTIONS[0].id, difficulty: 'adaptive', count: 10 };

function reducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SET_TOPIC':
      return state.phase === 'selection' ? { ...state, topicId: action.topicId } : state;
    case 'SET_DIFFICULTY':
      return state.phase === 'selection' ? { ...state, difficulty: action.difficulty } : state;
    case 'SET_COUNT':
      return state.phase === 'selection' ? { ...state, count: action.count } : state;
    case 'START_QUIZ': {
      if (state.phase !== 'selection') return state;
      const questions = getQuestions(state.topicId, state.count);
      return {
        phase: 'active',
        topicId: state.topicId,
        questions,
        index: 0,
        answers: new Array(questions.length).fill(null),
        flagged: new Set(),
      };
    }
    case 'SELECT_ANSWER': {
      if (state.phase !== 'active') return state;
      const answers = [...state.answers];
      answers[state.index] = action.optionIndex;
      return { ...state, answers };
    }
    case 'TOGGLE_FLAG': {
      if (state.phase !== 'active') return state;
      const flagged = new Set(state.flagged);
      if (flagged.has(state.index)) flagged.delete(state.index);
      else flagged.add(state.index);
      return { ...state, flagged };
    }
    case 'NEXT': {
      if (state.phase !== 'active') return state;
      if (state.index >= state.questions.length - 1) return state;
      return { ...state, index: state.index + 1 };
    }
    case 'PREV': {
      if (state.phase !== 'active') return state;
      if (state.index <= 0) return state;
      return { ...state, index: state.index - 1 };
    }
    case 'FINISH': {
      if (state.phase !== 'active') return state;
      return { phase: 'results', result: computeResults(state.questions, state.answers) };
    }
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function QuizGeneratorPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);

  useEffect(() => {
    if (state.phase !== 'active') return;
    setSecondsLeft(15 * 60);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [state.phase]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.phase]);

  return (
    <div className="relative">
      <div className="ai-glow absolute top-20 right-10 pointer-events-none" />
      <div
        className="ai-glow absolute bottom-20 left-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(132, 85, 239, 0.1) 0%, transparent 70%)' }}
      />

      {state.phase === 'selection' && (
        <section className="max-w-3xl mx-auto space-y-xl">
          <div className="text-center space-y-sm">
            <h2 className="font-display-lg text-display-lg text-on-surface">Knowledge Check</h2>
            <p className="text-body-lg text-on-surface-variant">
              Configure your adaptive AI session to reinforce your learning.
            </p>
          </div>
          <GlassCard className="rounded-[2rem] p-xl shadow-2xl space-y-lg relative overflow-hidden">
            <div className="absolute top-6 right-6 flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20 animate-pulse-soft">
              <MaterialIcon name="bolt" className="text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }} />
              <span className="text-label-sm font-bold text-primary">AI Twin Active</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <div className="space-y-sm">
                <label className="font-label-sm text-label-sm text-outline px-1">Select Topic</label>
                <div className="relative">
                  <select
                    value={state.topicId}
                    onChange={(event) => dispatch({ type: 'SET_TOPIC', topicId: event.target.value })}
                    className="w-full flex items-center gap-md bg-white border border-outline-variant rounded-xl p-md hover:border-primary transition-colors cursor-pointer appearance-none font-body-md"
                  >
                    {TOPIC_OPTIONS.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-sm">
                <label className="font-label-sm text-label-sm text-outline px-1">Difficulty Level</label>
                <div className="flex p-1 bg-surface-container rounded-xl gap-1">
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => dispatch({ type: 'SET_DIFFICULTY', difficulty: option.value })}
                      className={`flex-1 py-2 text-label-sm rounded-lg transition-all ${
                        state.difficulty === option.value
                          ? 'bg-white shadow-sm font-bold text-primary border border-primary/10'
                          : 'hover:bg-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-sm md:col-span-2">
                <label className="font-label-sm text-label-sm text-outline px-1">Number of Questions</label>
                <div className="flex items-center gap-lg pt-2">
                  <input
                    className="flex-1 h-2 bg-surface-container-high rounded-full appearance-none accent-primary cursor-pointer"
                    max={50}
                    min={5}
                    type="range"
                    value={state.count}
                    onChange={(event) => dispatch({ type: 'SET_COUNT', count: Number(event.target.value) })}
                  />
                  <span className="font-mono-code text-primary font-bold text-lg min-w-[40px]">{state.count}</span>
                </div>
              </div>
            </div>
            <div className="pt-lg">
              <button
                onClick={() => dispatch({ type: 'START_QUIZ' })}
                className="w-full bg-primary text-on-primary py-lg rounded-2xl font-headline-md shadow-[0px_8px_20px_rgba(70,72,212,0.3)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-md"
              >
                Generate Study Session
                <MaterialIcon name="auto_awesome" />
              </button>
            </div>
          </GlassCard>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {RECENT_TOPICS.map((topic) => (
              <GlassCard key={topic.id} className="p-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${topic.iconBgClass} ${topic.iconColorClass}`}>
                  <MaterialIcon name={topic.icon} />
                </div>
                <h4 className="font-bold">{topic.title}</h4>
                <p className="text-[12px] text-on-surface-variant">{topic.caption}</p>
              </GlassCard>
            ))}
            <GlassCard className="p-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-sm">
              <div className="w-10 h-10 rounded-xl bg-surface-variant/50 flex items-center justify-center text-on-surface-variant">
                <MaterialIcon name="add" />
              </div>
              <h4 className="font-bold">Custom Topic</h4>
              <p className="text-[12px] text-on-surface-variant">Upload PDF/Link</p>
            </GlassCard>
          </div>
        </section>
      )}

      {state.phase === 'active' && (
        <QuizActiveSection
          topicLabel={TOPIC_OPTIONS.find((t) => t.id === state.topicId)?.label ?? state.topicId}
          questions={state.questions}
          index={state.index}
          answers={state.answers}
          flagged={state.flagged}
          secondsLeft={secondsLeft}
          dispatch={dispatch}
        />
      )}

      {state.phase === 'results' && <QuizResultsSection result={state.result} dispatch={dispatch} />}
    </div>
  );
}

interface QuizActiveSectionProps {
  topicLabel: string;
  questions: Question[];
  index: number;
  answers: (number | null)[];
  flagged: Set<number>;
  secondsLeft: number;
  dispatch: React.Dispatch<QuizAction>;
}

function QuizActiveSection({ topicLabel, questions, index, answers, flagged, secondsLeft, dispatch }: QuizActiveSectionProps) {
  const question = questions[index];
  const selected = answers[index];
  const progressPercent = ((index + 1) / questions.length) * 100;
  const isLast = index === questions.length - 1;

  return (
    <section className="max-w-4xl mx-auto flex flex-col h-full space-y-lg">
      <ProgressBar percent={progressPercent} />
      <div className="flex justify-between items-center px-sm">
        <div className="flex items-center gap-md">
          <span className="font-mono-code font-bold text-primary">
            {String(index + 1).padStart(2, '0')} / {questions.length}
          </span>
          <span className="text-on-surface-variant text-label-sm">• {topicLabel}</span>
        </div>
        <div className="flex items-center gap-sm bg-white/50 px-4 py-1.5 rounded-full border border-white/40">
          <MaterialIcon name="timer" className="text-error text-[18px]" />
          <span className="font-mono-code text-on-surface font-bold">{formatTime(secondsLeft)}</span>
        </div>
      </div>
      <GlassCard className="rounded-[2.5rem] p-xl md:p-2xl shadow-xl space-y-xl">
        <h3 className="font-headline-md text-headline-md text-on-surface leading-relaxed">{question.prompt}</h3>
        <div className="grid grid-cols-1 gap-md">
          {question.options.map((option, optionIndex) => {
            const isSelected = selected === optionIndex;
            return (
              <button
                key={optionIndex}
                type="button"
                onClick={() => dispatch({ type: 'SELECT_ANSWER', optionIndex })}
                className={`group flex items-center text-left p-lg rounded-2xl transition-all outline-none ${
                  isSelected ? 'bg-primary/5 border-2 border-primary' : 'bg-white border border-outline-variant hover:border-primary hover:bg-primary/5'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-lg transition-all ${
                    isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary'
                  }`}
                >
                  {String.fromCharCode(65 + optionIndex)}
                </div>
                <span className={`flex-1 font-body-md ${isSelected ? 'text-on-surface font-semibold' : ''}`}>{option}</span>
                {isSelected && <MaterialIcon name="check_circle" className="text-primary" style={{ fontVariationSettings: "'FILL' 1" }} />}
              </button>
            );
          })}
        </div>
      </GlassCard>
      <div className="flex justify-between items-center px-sm pt-md">
        <button
          type="button"
          onClick={() => dispatch({ type: 'TOGGLE_FLAG' })}
          className={`flex items-center gap-sm font-bold transition-all ${flagged.has(index) ? 'text-error' : 'text-on-surface-variant hover:text-primary'}`}
        >
          <MaterialIcon name="flag" />
          {flagged.has(index) ? 'Flagged' : 'Flag for Review'}
        </button>
        <div className="flex gap-md">
          <button
            type="button"
            onClick={() => dispatch({ type: 'PREV' })}
            disabled={index === 0}
            className="px-xl py-md rounded-xl border border-outline-variant font-bold hover:bg-surface-container transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: isLast ? 'FINISH' : 'NEXT' })}
            className="px-xl py-md rounded-xl bg-primary text-on-primary font-bold shadow-lg hover:translate-y-[-2px] transition-all"
          >
            {isLast ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      </div>
    </section>
  );
}

function QuizResultsSection({ result, dispatch }: { result: QuizResult; dispatch: React.Dispatch<QuizAction> }) {
  const percent = result.total === 0 ? 0 : (result.score / result.total) * 100;
  const rating = percent === 100 ? 'Perfect' : percent >= 80 ? 'Excellent' : percent >= 60 ? 'Good' : 'Needs Review';

  return (
    <section className="max-w-4xl mx-auto space-y-xl">
      <div className="text-center space-y-sm">
        <h2 className="font-display-lg text-display-lg text-on-surface">Session Complete!</h2>
        <p className="text-body-lg text-on-surface-variant">Your Digital Twin has analyzed your performance.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
        <GlassCard className="md:col-span-5 rounded-[2rem] p-xl flex flex-col items-center justify-center text-center space-y-lg">
          <RingProgress percent={percent}>
            <span className="text-display-lg font-bold text-on-surface leading-none">
              {result.score}
              <span className="text-headline-md text-on-surface-variant">/{result.total}</span>
            </span>
            <span className="text-label-sm text-primary font-bold tracking-widest uppercase">{rating}</span>
          </RingProgress>
          <div className="space-y-sm">
            <p className="font-bold text-lg">{Math.round(percent)}% Accuracy</p>
          </div>
        </GlassCard>
        <div className="md:col-span-7 flex flex-col gap-lg">
          <GlassCard className="rounded-[2rem] p-lg border-primary/20 bg-primary/5">
            <div className="flex items-center gap-md mb-md">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <MaterialIcon name="smart_toy" className="text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }} />
              </div>
              <h4 className="font-bold text-primary">Twin Feedback</h4>
            </div>
            <p className="text-body-md leading-relaxed italic text-on-surface">
              {result.weakTopics.length === 0
                ? "Flawless run — you've fully mastered this topic set. Ready for a harder difficulty next time?"
                : `You're showing strong command of the basics. I recommend a focused review session on ${result.weakTopics.join(' and ')} before your next quiz.`}
            </p>
          </GlassCard>
          {result.weakTopics.length > 0 && (
            <GlassCard className="rounded-[2rem] p-lg space-y-md">
              <h4 className="font-bold flex items-center gap-sm">
                <MaterialIcon name="trending_down" className="text-error" />
                Focus Areas
              </h4>
              <div className="flex flex-wrap gap-sm">
                {result.weakTopics.map((topic) => (
                  <span
                    key={topic}
                    className="px-md py-sm rounded-full bg-error/10 text-error font-bold text-[13px] border border-error/20 flex items-center gap-2"
                  >
                    {topic}
                    <MaterialIcon name="info" className="text-[14px]" />
                  </span>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-lg justify-center pt-lg">
        <button
          type="button"
          onClick={() => dispatch({ type: 'RESET' })}
          className="px-xl py-lg rounded-2xl border border-outline-variant font-bold hover:bg-surface-container-high transition-all flex items-center justify-center gap-md"
        >
          <MaterialIcon name="refresh" />
          Retake Quiz
        </button>
        <button className="px-xl py-lg rounded-2xl bg-primary text-on-primary font-bold shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-md">
          Generate New Study Plan
          <MaterialIcon name="auto_awesome" />
        </button>
      </div>
    </section>
  );
}
