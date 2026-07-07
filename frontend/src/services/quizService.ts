import { supabase } from '../lib/supabaseClient';
import { generateQuizFeedback, generateQuizQuestions } from './aiService';

export interface CourseOption {
  id: string;
  name: string;
  masteryPercent: number;
}

export async function getCourses(userId: string): Promise<CourseOption[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('id, name, mastery_percent')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as { id: string; name: string; mastery_percent: number }[]).map((row) => ({
    id: row.id,
    name: row.name,
    masteryPercent: row.mastery_percent,
  }));
}

export async function createCourse(userId: string, name: string): Promise<CourseOption> {
  const { data, error } = await supabase
    .from('courses')
    .insert({ user_id: userId, name })
    .select('id, name, mastery_percent')
    .single();
  if (error) throw error;
  return { id: data.id, name: data.name, masteryPercent: data.mastery_percent };
}

export interface QuizQuestionRuntime {
  id: string;
  questionText: string;
  options: { label: string; text: string }[];
  correctOption: string;
  explanation: string;
}

export async function createQuizWithQuestions(
  userId: string,
  courseId: string,
  topic: string,
  difficulty: string,
  count: number,
): Promise<{ quizId: string; questions: QuizQuestionRuntime[] }> {
  const generated = await generateQuizQuestions(topic, difficulty, count);

  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .insert({ user_id: userId, course_id: courseId, title: topic, difficulty, question_count: generated.length })
    .select('id')
    .single();
  if (quizError) throw quizError;

  const rows = generated.map((q, index) => ({
    quiz_id: quiz.id,
    question_text: q.questionText,
    options: q.options,
    correct_option: q.correctOption,
    explanation: q.explanation,
    order_index: index,
  }));
  const { data: insertedQuestions, error: questionsError } = await supabase
    .from('quiz_questions')
    .insert(rows)
    .select('id, question_text, options, correct_option, explanation, order_index')
    .order('order_index', { ascending: true });
  if (questionsError) throw questionsError;

  const questions: QuizQuestionRuntime[] = (
    insertedQuestions as {
      id: string;
      question_text: string;
      options: { label: string; text: string }[];
      correct_option: string;
      explanation: string;
      order_index: number;
    }[]
  ).map((row) => ({
    id: row.id,
    questionText: row.question_text,
    options: row.options,
    correctOption: row.correct_option,
    explanation: row.explanation,
  }));

  return { quizId: quiz.id, questions };
}

export interface QuizSubmissionResult {
  score: number;
  total: number;
  accuracyPercent: number;
  feedback: string;
  weakTopics: string[];
}

export async function submitQuizAttempt(
  userId: string,
  quizId: string,
  topic: string,
  questions: QuizQuestionRuntime[],
  answers: (string | null)[],
  flagged: Set<number>,
  timeSpentSeconds: number,
): Promise<QuizSubmissionResult> {
  const score = questions.reduce((count, q, i) => (answers[i] === q.correctOption ? count + 1 : count), 0);
  const total = questions.length;
  const accuracyPercent = total === 0 ? 0 : Math.round((score / total) * 100);

  const { data: attempt, error: attemptError } = await supabase
    .from('quiz_attempts')
    .insert({
      quiz_id: quizId,
      user_id: userId,
      status: 'completed',
      completed_at: new Date().toISOString(),
      score,
      accuracy_percent: accuracyPercent,
      time_spent_seconds: timeSpentSeconds,
    })
    .select('id')
    .single();
  if (attemptError) throw attemptError;

  const answerRows = questions.map((q, i) => ({
    attempt_id: attempt.id,
    question_id: q.id,
    selected_option: answers[i],
    is_correct: answers[i] === q.correctOption,
    flagged_for_review: flagged.has(i),
  }));
  const { error: answersError } = await supabase.from('quiz_attempt_answers').insert(answerRows);
  if (answersError) throw answersError;

  const { feedback, weakTopics } = await generateQuizFeedback({
    topic,
    questions: questions.map((q) => ({ questionText: q.questionText, correctOption: q.correctOption })),
    answers,
    score,
    total,
  });

  const { error: updateError } = await supabase
    .from('quiz_attempts')
    .update({ ai_feedback: feedback })
    .eq('id', attempt.id);
  if (updateError) throw updateError;

  return { score, total, accuracyPercent, feedback, weakTopics };
}

export interface RecentTopic {
  id: string;
  title: string;
  caption: string;
  icon: string;
  iconColorClass: string;
  iconBgClass: string;
}

export async function getRecentTopics(userId: string): Promise<RecentTopic[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('id, name, mastery_percent')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
    .limit(2);
  if (error) throw error;

  const palette = [
    { icon: 'menu_book', iconColorClass: 'text-tertiary', iconBgClass: 'bg-tertiary/10' },
    { icon: 'functions', iconColorClass: 'text-primary', iconBgClass: 'bg-primary/10' },
  ];
  return (data as { id: string; name: string; mastery_percent: number }[]).map((row, index) => ({
    id: row.id,
    title: row.name,
    caption: `Mastery: ${Math.round(row.mastery_percent)}%`,
    ...palette[index % palette.length],
  }));
}
