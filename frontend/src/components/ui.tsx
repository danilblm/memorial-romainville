import { motion } from "framer-motion";
import { ButtonHTMLAttributes, ReactNode } from "react";
import { Link as RouterLink, LinkProps } from "react-router-dom";
import { cn } from "../utils/cn";

// --- Mise en page ---

export const Container = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>
);

// Petit sur-titre précédé d'un filet
export const Eyebrow = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p
    className={cn(
      "flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-accent",
      "before:h-px before:w-8 before:bg-current before:opacity-60",
      className
    )}
  >
    {children}
  </p>
);

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  lead?: string;
  id?: string;
  className?: string;
  light?: boolean;
  center?: boolean;
}

export const SectionHeading = ({ eyebrow, title, lead, id, className, light, center }: SectionHeadingProps) => (
  <div className={cn("max-w-2xl", center && "mx-auto text-center", className)}>
    {eyebrow && <Eyebrow className={cn(light && "text-on-night-soft", center && "justify-center")}>{eyebrow}</Eyebrow>}
    <h2
      id={id}
      className={cn(
        "mt-4 font-display text-4xl font-medium leading-[1.08] tracking-tight text-balance sm:text-5xl",
        light ? "text-on-night" : "text-ink"
      )}
    >
      {title}
    </h2>
    {lead && (
      <p className={cn("mt-5 text-lg leading-relaxed text-pretty", light ? "text-on-night-soft" : "text-ink-soft")}>{lead}</p>
    )}
  </div>
);

// En-tête des pages intérieures
interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}

export const PageHeader = ({ eyebrow, title, lead, children }: PageHeaderProps) => (
  <header className="relative overflow-hidden border-b border-line bg-paper-2">
    <Container className="relative py-14 sm:py-20">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="mt-4 max-w-3xl font-display text-5xl font-medium leading-[1.04] tracking-tight text-balance text-ink sm:text-6xl">
          {title}
        </h1>
        {lead && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-ink-soft">{lead}</p>}
        {children}
      </motion.div>
    </Container>
  </header>
);

// Apparition douce de chaque page
export const Page = ({ children }: { children: ReactNode }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
    {children}
  </motion.div>
);

// --- Boutons ---

type Variant = "primary" | "secondary" | "ghost" | "light";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink shadow-soft hover:-translate-y-0.5 hover:shadow-lift hover:brightness-110",
  secondary: "border border-ink/15 bg-card text-ink shadow-soft hover:-translate-y-0.5 hover:border-ink/40 hover:shadow-lift",
  ghost: "text-ink hover:bg-ink/5",
  light: "border border-on-night/30 text-on-night hover:-translate-y-0.5 hover:border-on-night/60 hover:bg-on-night/10",
};

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition duration-200 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

export const ButtonLink = ({ variant = "primary", className, ...props }: LinkProps & { variant?: Variant }) => (
  <RouterLink className={cn(BUTTON_BASE, VARIANTS[variant], className)} {...props} />
);

export const Button = ({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) => (
  <button className={cn(BUTTON_BASE, VARIANTS[variant], className)} {...props} />
);

// --- Étiquettes et cartes ---

export const Tag = ({ children, to, className }: { children: ReactNode; to?: string; className?: string }) => {
  const classes = cn(
    "inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1 text-sm text-ink",
    to && "transition duration-200 hover:-translate-y-0.5 hover:border-accent hover:text-accent hover:shadow-soft",
    className
  );
  return to ? (
    <RouterLink to={to} className={classes}>
      {children}
    </RouterLink>
  ) : (
    <span className={classes}>{children}</span>
  );
};

export const Card = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("rounded-2xl border border-line/80 bg-card p-6 shadow-soft", className)}>{children}</div>
);

export const CardTitle = ({ children, className }: { children: ReactNode; className?: string }) => (
  <h2 className={cn("font-display text-xl font-medium tracking-tight text-ink", className)}>{children}</h2>
);
