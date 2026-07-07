import type { Question, QuizResult, QuizTopicOption } from '../types/domain';

// Mock data shaped after the `quizzes`/`quiz_questions` Supabase tables.
// Swap getQuestions() for a real Supabase/API call once quiz generation
// exists server-side.
export const TOPIC_OPTIONS: QuizTopicOption[] = [
  { id: 'molecular-biology', label: 'Molecular Biology' },
  { id: 'organic-chemistry', label: 'Organic Chemistry' },
  { id: 'calculus-iii', label: 'Calculus III' },
];

export const RECENT_TOPICS = [
  { id: 'organic-chemistry', icon: 'menu_book', iconColorClass: 'text-tertiary', iconBgClass: 'bg-tertiary/10', title: 'Organic Chemistry', caption: 'Last session: 2 days ago' },
  { id: 'calculus-iii', icon: 'functions', iconColorClass: 'text-primary', iconBgClass: 'bg-primary/10', title: 'Calculus III', caption: 'Mastery: 84%' },
];

const QUESTION_BANK: Record<string, Question[]> = {
  'molecular-biology': [
    {
      id: 'q1',
      prompt:
        'Which of the following describes the mechanism by which DNA polymerase III ensures high fidelity during replication in E. coli?',
      options: [
        "By using 5' to 3' exonuclease activity to remove RNA primers.",
        "By utilizing 3' to 5' exonuclease activity for proofreading.",
        'Through the action of DNA ligase sealing the Okazaki fragments.',
        'By stabilizing the replication fork with single-strand binding proteins.',
      ],
      correctIndex: 1,
    },
    {
      id: 'q2',
      prompt: 'Which enzyme is primarily responsible for unwinding the DNA double helix at the replication fork?',
      options: ['DNA ligase', 'Primase', 'Helicase', 'Topoisomerase'],
      correctIndex: 2,
    },
    {
      id: 'q3',
      prompt: 'During translation, what is the role of aminoacyl-tRNA synthetase?',
      options: [
        'It attaches the correct amino acid to its corresponding tRNA.',
        'It catalyzes peptide bond formation on the ribosome.',
        'It removes introns from pre-mRNA.',
        'It initiates transcription at the promoter.',
      ],
      correctIndex: 0,
    },
    {
      id: 'q4',
      prompt: 'Enzyme kinetics: what does a lower Km value indicate about an enzyme-substrate pair?',
      options: [
        'Lower affinity between enzyme and substrate.',
        'Higher affinity between enzyme and substrate.',
        'The reaction is irreversible.',
        'The enzyme requires a cofactor.',
      ],
      correctIndex: 1,
    },
  ],
};

export function getQuestions(topicId: string, count: number): Question[] {
  const bank = QUESTION_BANK[topicId] ?? QUESTION_BANK['molecular-biology'];
  const questions: Question[] = [];
  for (let i = 0; i < count; i += 1) {
    questions.push(bank[i % bank.length]);
  }
  return questions;
}

export function computeResults(questions: Question[], answers: (number | null)[]): QuizResult {
  const total = questions.length;
  const score = questions.reduce(
    (correctCount, question, index) => (answers[index] === question.correctIndex ? correctCount + 1 : correctCount),
    0,
  );
  const weakTopics = score === total ? [] : ['Enzyme Kinetics', 'Protein Synthesis'];
  return { score, total, weakTopics };
}
