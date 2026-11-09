// Règles de publication communes à tous les services publics.

export const PUBLISHED = { status: "valide" };

// Une fiche masquée n'apparaît nulle part ; une fiche réservée garde seulement le nom.
export const PUBLIC_PERSON_FILTER = {
  status: "valide",
  "publication.visibility": { $ne: "masquee" },
};

// On ne montre au public que les affirmations validées.
export const onlyValidatedClaims = <T extends object>(doc: T): T => {
  const claims = (doc as { claims?: { status?: string | null }[] }).claims ?? [];
  return { ...doc, claims: claims.filter((claim) => claim.status === "valide") };
};
