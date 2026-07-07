import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';

const FEATURES = [
  {
    icon: 'psychology',
    iconBgClass: 'bg-primary/10',
    iconTextClass: 'text-primary',
    title: 'AI Mentor',
    body: 'A 24/7 companion that explains complex topics using your specific mental models and previous knowledge.',
    linkLabel: 'Learn more',
    linkTextClass: 'text-primary',
  },
  {
    icon: 'quiz',
    iconBgClass: 'bg-tertiary/10',
    iconTextClass: 'text-tertiary',
    title: 'Automated Quizzes',
    body: 'Instantly transform your notes into adaptive flashcards and active-recall quizzes designed to fix your weak spots.',
    linkLabel: 'Explore dynamic testing',
    linkTextClass: 'text-tertiary',
  },
  {
    icon: 'auto_stories',
    iconBgClass: 'bg-secondary-container',
    iconTextClass: 'text-on-secondary-container',
    title: 'Strategy Roadmap',
    body: 'An intelligent schedule that balances your cognitive load across different subjects for maximum retention.',
    linkLabel: 'See study plans',
    linkTextClass: 'text-secondary',
  },
];

const TESTIMONIALS = [
  {
    name: 'Alex Rivera',
    role: 'Med School Sophomore',
    quote: "StudyTwin literally saved my anatomy finals. It predicts exactly where I'm going to struggle.",
  },
  {
    name: 'Sarah Chen',
    role: 'Computer Science',
    quote: 'The automated quizzes are a game-changer. I cut my study time by 30% while getting higher grades.',
  },
  {
    name: 'James Wilson',
    role: 'Law Student',
    quote: 'It feels like having a professor who knows exactly how my brain works. Invaluable for bar prep.',
  },
  {
    name: 'Elena Kostic',
    role: 'Bio-Chemistry Senior',
    quote: "The strategy roadmap keeps me calm. I don't panic because I know the AI has a plan for me.",
  },
];

const REVEAL_CLASSES = 'reveal-on-scroll transition-all duration-700 opacity-0 translate-y-10';

export function LandingPage() {
  const navigate = useNavigate();
  const revealRef = useScrollReveal<HTMLDivElement>();
  const sphereRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;
      sphereRefs.forEach((sphereRef, index) => {
        const multiplier = 20 * (index + 1);
        const moveX = (x - 0.5) * multiplier;
        const moveY = (y - 0.5) * multiplier;
        if (sphereRef.current) sphereRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    }
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={revealRef}>
      <section className="relative pt-2xl pb-2xl md:pt-xl overflow-hidden">
        <div ref={sphereRefs[0]} className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10" />
        <div ref={sphereRefs[1]} className="absolute top-40 -left-20 w-80 h-80 bg-tertiary/10 rounded-full blur-[100px] -z-10" />
        <div className="max-w-container-max mx-auto px-lg grid grid-cols-1 lg:grid-cols-2 gap-xl items-center">
          <div className="z-10 text-center lg:text-left">
            <span className="inline-flex items-center px-md py-unit rounded-full bg-primary/10 text-primary font-label-sm text-label-sm mb-md">
              Introducing Gemini-Powered Personalization
            </span>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-md leading-tight">
              Your Digital <span className="text-primary">Learning Twin</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mx-auto lg:mx-0 mb-xl">
              A personalized AI that mirrors your learning style, anticipates your questions, and builds a custom
              roadmap for your academic success.
            </p>
            <div className="flex flex-col sm:flex-row gap-md justify-center lg:justify-start">
              <button
                onClick={() => navigate('/sign-in')}
                className="bg-primary text-on-primary font-label-sm text-label-sm px-xl py-md rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 active:scale-95"
              >
                Get Started for Free
              </button>
              <button className="glass-card flex items-center justify-center gap-sm px-xl py-md rounded-xl font-label-sm text-label-sm hover:bg-white/60 transition-all">
                <span className="material-symbols-outlined">play_circle</span>
                Watch Demo
              </button>
            </div>
          </div>
          <div className="relative flex justify-center items-center">
            <div className="relative w-full max-w-md aspect-square">
              <div className="absolute inset-0 glass-card rounded-[40px] flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-500 overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center opacity-80"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAigBELSFF9wAp68pkvHfDzJAiWcqZAXYMud44_ZGBwhvbs-YM6aEFx3k7IEW5aIpRFD3ppc9E0B37NvjHvR7UNqBhMuEJPbrL7HjaQqWPo7BgO24l_RvfM3s_-d7ob8Aza4vW95jtWhUyscHRYfQi4WzkFdTOcPWiLXZ6SwV40BR-cfzkOBnupIEifHJebZhJIitkFI7caJXu2HHNGayE5gJZajl-pIyrgJMeWb4BjaafaFZr9BWGhN4rCjxAcuVc6FzGp8crY-A')",
                  }}
                />
              </div>
              <div className="absolute -bottom-6 -left-6 glass-card p-lg rounded-2xl flex items-center gap-md shadow-xl border-white/50">
                <div className="w-12 h-12 bg-tertiary-container rounded-lg flex items-center justify-center text-on-tertiary-container">
                  <span className="material-symbols-outlined">psychology</span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm font-bold">AI Mentor Active</p>
                  <p className="text-[12px] text-on-surface-variant">Syncing with your syllabus...</p>
                </div>
              </div>
              <div className="absolute top-10 -right-8 glass-card p-md rounded-full px-lg flex items-center gap-sm">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="font-label-sm text-label-sm font-medium">98% Clarity Score</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-2xl bg-surface-container-low/30">
        <div className="max-w-container-max mx-auto px-lg">
          <div className="text-center mb-2xl">
            <h2 className="font-headline-md text-headline-md mb-sm">Tools for Cognitive Clarity</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Precision engineered for the modern student experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className={`glass-card p-xl rounded-3xl flex flex-col gap-md hover:-translate-y-2 transition-transform duration-300 ${REVEAL_CLASSES}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${feature.iconBgClass} ${feature.iconTextClass}`}>
                  <span className="material-symbols-outlined">{feature.icon}</span>
                </div>
                <h3 className="font-headline-md text-headline-md">{feature.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{feature.body}</p>
                <div className={`mt-auto pt-md flex items-center gap-xs font-label-sm text-label-sm ${feature.linkTextClass}`}>
                  {feature.linkLabel} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-2xl">
        <div className="max-w-container-max mx-auto px-lg">
          <div className="mb-xl flex flex-col md:flex-row items-end justify-between gap-md">
            <div>
              <h2 className="font-headline-md text-headline-md mb-xs">Loved by High-Achievers</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Hear from students who've mastered their curriculums.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {TESTIMONIALS.map((testimonial) => (
              <div key={testimonial.name} className={`glass-card p-lg rounded-2xl border-white/20 ${REVEAL_CLASSES}`}>
                <div className="flex items-center gap-sm mb-md">
                  <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant">account_circle</span>
                  </div>
                  <div>
                    <p className="font-label-sm text-label-sm font-bold">{testimonial.name}</p>
                    <p className="text-[12px] text-on-surface-variant">{testimonial.role}</p>
                  </div>
                </div>
                <p className="font-body-md text-body-md italic text-on-surface-variant">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-2xl relative overflow-hidden">
        <div className="max-w-container-max mx-auto px-lg">
          <div className="glass-card bg-primary-container p-2xl rounded-[48px] text-center text-on-primary-container relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />
            <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-md relative z-10">
              Join 50,000+ students leveling up their grades.
            </h2>
            <p className="font-body-lg text-body-lg text-primary-fixed max-w-2xl mx-auto mb-xl relative z-10">
              Stop studying harder. Start studying smarter with your own Digital Twin. Join the waiting list or start
              your 14-day premium trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-md justify-center relative z-10">
              <button
                onClick={() => navigate('/sign-in')}
                className="bg-surface text-primary font-label-sm text-label-sm px-xl py-md rounded-xl hover:bg-surface-bright transition-colors"
              >
                Claim Free Trial
              </button>
              <button className="border border-white/40 text-white font-label-sm text-label-sm px-xl py-md rounded-xl hover:bg-white/10 transition-colors">
                Contact Institutional Sales
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
