// Assemble des classes Tailwind en ignorant les valeurs vides
export const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");
