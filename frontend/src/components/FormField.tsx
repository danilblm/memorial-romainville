import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../utils/cn";

const CONTROL =
  "mt-2 block w-full rounded-xl border border-line bg-card px-4 py-3 text-ink placeholder:text-ink-soft/60 transition focus:border-accent focus:ring-4 focus:ring-accent/15 focus:outline-none";

interface FieldShellProps {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

const FieldShell = ({ id, label, hint, required, children, className }: FieldShellProps) => (
  <div className={className}>
    <label htmlFor={id} className="text-sm font-semibold text-ink">
      {label}
      {required && <span className="text-accent"> *</span>}
    </label>
    {children}
    {hint && (
      <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink-soft">
        {hint}
      </p>
    )}
  </div>
);

type Common = { id: string; label: string; hint?: string; className?: string };

export const TextInput = ({ id, label, hint, className, ...props }: Common & InputHTMLAttributes<HTMLInputElement>) => (
  <FieldShell id={id} label={label} hint={hint} required={props.required} className={className}>
    <input id={id} aria-describedby={hint ? `${id}-hint` : undefined} className={CONTROL} {...props} />
  </FieldShell>
);

export const TextArea = ({ id, label, hint, className, ...props }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <FieldShell id={id} label={label} hint={hint} required={props.required} className={className}>
    <textarea id={id} aria-describedby={hint ? `${id}-hint` : undefined} className={cn(CONTROL, "min-h-32")} {...props} />
  </FieldShell>
);

export const SelectInput = ({
  id,
  label,
  hint,
  className,
  children,
  ...props
}: Common & SelectHTMLAttributes<HTMLSelectElement>) => (
  <FieldShell id={id} label={label} hint={hint} required={props.required} className={className}>
    <select id={id} className={cn(CONTROL, "appearance-none")} {...props}>
      {children}
    </select>
  </FieldShell>
);
