export function Footer() {
  return (
    <footer className="mt-auto border-t border-outline-variant/20 bg-surface">
      <div className="max-w-container-max mx-auto px-lg py-xl flex flex-col md:flex-row justify-between items-center gap-md">
        <div className="flex flex-col items-center md:items-start">
          <span className="font-headline-md text-headline-md font-bold text-primary">StudyTwin AI</span>
          <p className="font-label-sm text-label-sm text-secondary">© 2024 StudyTwin AI. All rights reserved.</p>
        </div>
        <div className="flex gap-lg">
          <a className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" href="#">
            Privacy Policy
          </a>
          <a className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" href="#">
            Terms of Service
          </a>
          <a className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" href="#">
            Help Center
          </a>
          <a className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" href="#">
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
}
