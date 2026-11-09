import { motion } from "framer-motion";
import { ButtonHTMLAttributes, ReactNode } from "react";
import { Link as RouterLink, LinkProps } from "react-router-dom";
import { cn } from "../utils/cn";

// --- Mise en page ---

export const Container = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>
);

export const Eyebrow = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={cn("text-xs font-semibold uppercase tracking-[0.2em] text-accent", className)}>{children}</p>
);

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  lead?: string;
  id?: string;
  className?: string;
  light?: boolean;
}

export const SectionHeading = ({ eyebrow, title, lead, id, className, light }: SectionHeadingProps) => (
  <div className={cn("max-w-2xl", className)}>
    {eyebrow && <Eyebrow className={light ? "text-gold" : undefined}>{eyebrow}</Eyebrow>}
    <h2
      id={id}
      className={cn(
        "mt-3 font-display text-3xl font-medium leading-tight sm:text-4xl",
        light ? "text-on-night" : "text-ink"
      )}
    >
      {title}
    </h2>
    {lead && <p className={cn("mt-4 text-lg leading-relaxed", light ? "text-on-night-soft" : "text-ink-soft")}>{lead}</p>}
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
  <header className="border-b border-line bg-paper-2/60">
    <Container className="py-12 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-medium leading-[1.1] text-ink sm:text-5xl">{title}</h1>
        {lead && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">{lead}</p>}
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
  primary: "bg-accent text-accent-ink hover:brightness-110 shadow-sm",
  secondary: "border border-ink/20 bg-card text-ink hover:border-ink/50",
  ghost: "text-ink hover:bg-ink/5",
  light: "border border-on-night/30 text-on-night hover:bg-on-night/10",
};

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50";

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
    to && "transition hover:border-accent hover:text-accent",
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
  <div className={cn("rounded-2xl border border-line bg-card p-6 shadow-[0_1px_0_rgb(0_0_0/0.03)]", className)}>
    {children}
  </div>
);

export const CardTitle = ({ children, className }: { children: ReactNode; className?: string }) => (
  <h2 className={cn("font-display text-xl font-medium text-ink", className)}>{children}</h2>
);
