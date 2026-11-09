// Génère un mot de passe provisoire lisible (sans caractères ambigus comme 0/O, 1/l)
const ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const generatePassword = (length = 14) => {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => ALPHABET[value % ALPHABET.length]).join("");
};
