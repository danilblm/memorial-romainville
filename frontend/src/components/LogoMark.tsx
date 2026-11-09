// Emblème : le plan en étoile du fort, une pomme en son cœur
const LogoMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
    <polygon points="20,3 37,15 31,36 9,36 3,15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="20" cy="22" r="6" className="fill-accent" />
    <path d="M20 16 q2 -4 5 -4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export default LogoMark;
