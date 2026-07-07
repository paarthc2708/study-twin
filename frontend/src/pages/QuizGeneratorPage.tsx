import { useCallback, useEffect, useReducer, useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { ProgressBar } from '../components/ui/ProgressBar';
import { RingProgress } from '../components/charts/RingProgress';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastProvider';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import {
  createCourse,
  createQuizWithQuestions,
  getCourses,
  getRecentTopics,
  submitQuizAttempt,
  type QuizQuestionRuntime,
  type QuizSubmissionResult,
} from '../services/quizService';

type Difficulty = 'standard' | 'adaptive_ai' | 'expert';

type QuizPhase =
  | { phase: 'selection' }
  | {
      phase: 'active';
      quizId: string;
      topic: string;
      questions: QuizQuestionRuntime[];
      index: number;
      answers: (string | null)[];
      flagged: Set<number>;
      startedAt: number;
      isSubmitting: boolean;
    }
  | { phase: 'results'; result: QuizSubmissionResult };

type QuizAction =
  | { type: 'BEGIN'; quizId: string; topic: string; questions: QuizQuestionRuntime[] }
  | { type: 'SELECT_ANSWER'; label: string }
  | { type: 'TOGGLE_FLAG' }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'START_SUBMIT' }
  | { type: 'SUBMIT_FAILED' }
  | { type: 'SHOW_RESULTS'; result: QuizSubmissionResult }
  | { type: 'RESET' };

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'adaptive_ai', label: 'Adaptive AI' },
  { value: 'expert', label: 'Expert' },
];

const NEW_COURSE_VALUE = '__new__';

function reducer(state: QuizPhase, action: QuizAction): QuizPhase {
  switch (action.type) {
    case 'BEGIN':
      return {
        phase: 'active',
        quizId: action.quizId,
        topic: action.topic,
        questions: action.questions,
        index: 0,
        answers: new Array(action.questions.length).fill(null),
        flagged: new Set(),
        startedAt: Date.now(),
        isSubmitting: false,
      };
    case 'SELECT_ANSWER': {
      if (state.phase !== 'active') return state;
      const answers = [...state.answers];
      answers[state.index] = action.label;
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
    case 'START_SUBMIT':
      return state.phase === 'active' ? { ...state, isSubmitting: true } : state;
    case 'SUBMIT_FAILED':
      return state.phase === 'active' ? { ...state, isSubmitting: false } : state;
    case 'SHOW_RESULTS':
      return { phase: 'results', result: action.result };
    case 'RESET':
      return { phase: 'selection' };
    default:
      return state;
  }
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function QuizGeneratorPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [state, dispatch] = useReducer(reducer, { phase: 'selection' });
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);

  const loadSelectionData = useCallback(async () => {
    const userId = user!.id;
    const [courses, recentTopics] = await Promise.all([getCourses(userId), getRecentTopics(userId)]);
    return { courses, recentTopics };
  }, [user]);
  const { data, loading, error, refetch } = useSupabaseQuery(loadSelectionData, [user?.id]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [newCourseName, setNewCourseName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('adaptive_ai');
  const [count, setCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (data && data.courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(data.courses[0].id);
    } else if (data && data.courses.length === 0) {
      setSelectedCourseId(NEW_COURSE_VALUE);
    }
  }, [data, selectedCourseId]);

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

  async function handleGenerate() {
    if (!user || !data) return;
    setIsGenerating(true);
    try {
      let courseId = selectedCourseId;
      let topic = data.courses.find((c) => c.id === selectedCourseId)?.name ?? '';

      if (selectedCourseId === NEW_COURSE_VALUE) {
        if (!newCourseName.trim()) {
          showToast('Enter a course name first.');
          return;
        }
        const course = await createCourse(user.id, newCourseName.trim());
        courseId = course.id;
        topic = course.name;
        setNewCourseName('');
        refetch();
      }

      if (!courseId || !topic) {
        showToast('Select or create a course first.');
        return;
      }

      const { quizId, questions } = await createQuizWithQuestions(user.id, courseId, topic, difficulty, count);
      dispatch({ type: 'BEGIN', quizId, topic, questions });
    } catch (err) {
      showToast(errorMessage(err, 'Could not generate quiz.'));
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleFinish() {
    if (state.phase !== 'active' || !user) return;
    dispatch({ type: 'START_SUBMIT' });
    try {
      const timeSpentSeconds = Math.round((Date.now() - state.startedAt) / 1000);
      const result = await submitQuizAttempt(
        user.id,
        state.quizId,
        state.topic,
        state.questions,
        state.answers,
        state.flagged,
        timeSpentSeconds,
      );
      dispatch({ type: 'SHOW_RESULTS', result });
    } catch (err) {
      showToast(errorMessage(err, 'Could not submit quiz.'));
      dispatch({ type: 'SUBMIT_FAILED' });
    }
  }

  async function handleGenerateNewPlan() {
    dispatch({ type: 'RESET' });
    await handleGenerate();
  }

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

          {loading && <p className="text-center text-on-surface-variant">Loading your courses…</p>}
          {error && (
            <div className="text-center space-y-sm">
              <p className="text-error">{error}</p>
              <button onClick={refetch} className="text-primary font-bold hover:underline">
                Try again
              </button>
            </div>
          )}

          {data && (
            <>
              <GlassCard className="rounded-[2rem] p-xl shadow-2xl space-y-lg relative overflow-hidden">
                <div className="absolute top-6 right-6 flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20 animate-pulse-soft">
                  <MaterialIcon name="bolt" className="text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }} />
                  <span className="text-label-sm font-bold text-primary">AI Twin Active</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div className="space-y-sm">
                    <label className="font-label-sm text-label-sm text-outline px-1">Select Course</label>
                    <select
                      value={selectedCourseId}
                      onChange={(event) => setSelectedCourseId(event.target.value)}
                      className="w-full bg-white border border-outline-variant rounded-xl p-md hover:border-primary transition-colors cursor-pointer appearance-none font-body-md"
                    >
                      {data.courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                      <option value={NEW_COURSE_VALUE}>+ New course…</option>
                    </select>
                    {selectedCourseId === NEW_COURSE_VALUE && (
                      <input
                        value={newCourseName}
                        onChange={(event) => setNewCourseName(event.target.value)}
                        placeholder="e.g. Organic Chemistry"
                        className="w-full mt-sm px-md py-sm bg-surface-container-low border-none rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    )}
                  </div>
                  <div className="space-y-sm">
                    <label className="font-label-sm text-label-sm text-outline px-1">Difficulty Level</label>
                    <div className="flex p-1 bg-surface-container rounded-xl gap-1">
                      {DIFFICULTY_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDifficulty(option.value)}
                          className={`flex-1 py-2 text-label-sm rounded-lg transition-all ${
                            difficulty === option.value
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
                        value={count}
                        onChange={(event) => setCount(Number(event.target.value))}
                      />
                      <span className="font-mono-code text-primary font-bold text-lg min-w-[40px]">{count}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-lg">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-primary text-on-primary py-lg rounded-2xl font-headline-md shadow-[0px_8px_20px_rgba(70,72,212,0.3)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-md disabled:opacity-60"
                  >
                    {isGenerating ? 'Generating with AI…' : 'Generate Study Session'}
                    <MaterialIcon name="auto_awesome" />
                  </button>
                </div>
              </GlassCard>

              {data.recentTopics.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                  {data.recentTopics.map((topic) => (
                    <GlassCard
                      key={topic.id}
                      onClick={() => setSelectedCourseId(topic.id)}
                      className="p-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-sm"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${topic.iconBgClass} ${topic.iconColorClass}`}>
                        <MaterialIcon name={topic.icon} />
                      </div>
                      <h4 className="font-bold">{topic.title}</h4>
                      <p className="text-[12px] text-on-surface-variant">{topic.caption}</p>
                    </GlassCard>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {state.phase === 'active' && (
        <QuizActiveSection
          topic={state.topic}
          questions={state.questions}
          index={state.index}
          answers={state.answers}
          flagged={state.flagged}
          secondsLeft={secondsLeft}
          isSubmitting={state.isSubmitting}
          dispatch={dispatch}
          onFinish={handleFinish}
        />
      )}

      {state.phase === 'results' && (
        <QuizResultsSection result={state.result} onRetake={() => dispatch({ type: 'RESET' })} onNewPlan={handleGenerateNewPlan} />
      )}
    </div>
  );
}

interface QuizActiveSectionProps {
  topic: string;
  questions: QuizQuestionRuntime[];
  index: number;
  answers: (string | null)[];
  flagged: Set<number>;
  secondsLeft: number;
  isSubmitting: boolean;
  dispatch: React.Dispatch<QuizAction>;
  onFinish: () => void;
}

function QuizActiveSection({ topic, questions, index, answers, flagged, secondsLeft, isSubmitting, dispatch, onFinish }: QuizActiveSectionProps) {
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
          <span className="text-on-surface-variant text-label-sm">• {topic}</span>
        </div>
        <div className="flex items-center gap-sm bg-white/50 px-4 py-1.5 rounded-full border border-white/40">
          <MaterialIcon name="timer" className="text-error text-[18px]" />
          <span className="font-mono-code text-on-surface font-bold">{formatTime(secondsLeft)}</span>
        </div>
      </div>
      <GlassCard className="rounded-[2.5rem] p-xl md:p-2xl shadow-xl space-y-xl">
        <h3 className="font-headline-md text-headline-md text-on-surface leading-relaxed">{question.questionText}</h3>
        <div className="grid grid-cols-1 gap-md">
          {question.options.map((option) => {
            const isSelected = selected === option.label;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => dispatch({ type: 'SELECT_ANSWER', label: option.label })}
                className={`group flex items-center text-left p-lg rounded-2xl transition-all outline-none ${
                  isSelected ? 'bg-primary/5 border-2 border-primary' : 'bg-white border border-outline-variant hover:border-primary hover:bg-primary/5'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-lg transition-all ${
                    isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary'
                  }`}
                >
                  {option.label}
                </div>
                <span className={`flex-1 font-body-md ${isSelected ? 'text-on-surface font-semibold' : ''}`}>{option.text}</span>
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
            onClick={() => (isLast ? onFinish() : dispatch({ type: 'NEXT' }))}
            disabled={isSubmitting}
            className="px-xl py-md rounded-xl bg-primary text-on-primary font-bold shadow-lg hover:translate-y-[-2px] transition-all disabled:opacity-60"
          >
            {isLast ? (isSubmitting ? 'Scoring…' : 'Finish Quiz') : 'Next Question'}
          </button>
        </div>
      </div>
    </section>
  );
}

function QuizResultsSection({
  result,
  onRetake,
  onNewPlan,
}: {
  result: QuizSubmissionResult;
  onRetake: () => void;
  onNewPlan: () => void;
}) {
  const rating =
    result.accuracyPercent === 100 ? 'Perfect' : result.accuracyPercent >= 80 ? 'Excellent' : result.accuracyPercent >= 60 ? 'Good' : 'Needs Review';

  return (
    <section className="max-w-4xl mx-auto space-y-xl">
      <div className="text-center space-y-sm">
        <h2 className="font-display-lg text-display-lg text-on-surface">Session Complete!</h2>
        <p className="text-body-lg text-on-surface-variant">Your Digital Twin has analyzed your performance.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
        <GlassCard className="md:col-span-5 rounded-[2rem] p-xl flex flex-col items-center justify-center text-center space-y-lg">
          <RingProgress percent={result.accuracyPercent}>
            <span className="text-display-lg font-bold text-on-surface leading-none">
              {result.score}
              <span className="text-headline-md text-on-surface-variant">/{result.total}</span>
            </span>
            <span className="text-label-sm text-primary font-bold tracking-widest uppercase">{rating}</span>
          </RingProgress>
          <p className="font-bold text-lg">{result.accuracyPercent}% Accuracy</p>
        </GlassCard>
        <div className="md:col-span-7 flex flex-col gap-lg">
          <GlassCard className="rounded-[2rem] p-lg border-primary/20 bg-primary/5">
            <div className="flex items-center gap-md mb-md">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <MaterialIcon name="smart_toy" className="text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }} />
              </div>
              <h4 className="font-bold text-primary">Twin Feedback</h4>
            </div>
            <p className="text-body-md leading-relaxed italic text-on-surface">{result.feedback}</p>
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
          onClick={onRetake}
          className="px-xl py-lg rounded-2xl border border-outline-variant font-bold hover:bg-surface-container-high transition-all flex items-center justify-center gap-md"
        >
          <MaterialIcon name="refresh" />
          Retake Quiz
        </button>
        <button
          type="button"
          onClick={onNewPlan}
          className="px-xl py-lg rounded-2xl bg-primary text-on-primary font-bold shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-md"
        >
          Generate New Study Plan
          <MaterialIcon name="auto_awesome" />
        </button>
      </div>
    </section>
  );
}
