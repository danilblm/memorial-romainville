import { cn } from "../utils/cn";

// Logo du mémorial : le fort et son mirador dans une couronne de coquelicots, marguerites et bleuets.
// - « embleme » : le dessin seul, pour la barre de navigation (le nom du site est écrit à côté)
// - « complet » : le dessin avec « Fort de Romainville – Dépoussiérer l'histoire »
// Les dimensions réelles évitent que la page « saute » pendant le chargement de l'image.
const VARIANTS = {
  embleme: { src: "/brand/logo-embleme.webp", width: 520, height: 329 },
  complet: { src: "/brand/logo-complet.webp", width: 1100, height: 905 },
} as const;

interface LogoMarkProps {
  className?: string;
  variant?: keyof typeof VARIANTS;
  alt?: string; // vide quand le nom du site est déjà écrit à côté
}

const LogoMark = ({ className, variant = "embleme", alt = "" }: LogoMarkProps) => {
  const { src, width, height } = VARIANTS[variant];
  return (
    <img
      src={src}
      width={width}
      height={height}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      decoding="async"
      className={cn("brand-logo h-auto select-none object-contain", className)}
      draggable={false}
    />
  );
};

export default LogoMark;
