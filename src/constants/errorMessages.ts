export const AUTH_ERRORS = {
  "Invalid login credentials": "Identifiants invalides",
  "Email not confirmed":
    "Email non confirmé. Veuillez vérifier votre boîte mail",
  "User already registered": "Un compte existe déjà avec cet email",
  "Password is too short":
    "Le mot de passe doit contenir au moins 6 caractères",
  "Invalid email": "L'adresse email n'est pas valide",
  "Email required": "L'adresse email est requise",
  "Password required": "Le mot de passe est requis",
  "Username required": "Le nom d'utilisateur est requis",
  "Passwords do not match": "Les mots de passe ne correspondent pas",
  "Network error":
    "Erreur de connexion, veuillez vérifier votre connexion internet",
  default: "Une erreur inattendue s'est produite",
} as const;

export const getErrorMessage = (error: any): string => {
  if (!error) return "";

  // Si c'est une erreur Supabase
  if (error.message) {
    return (
      AUTH_ERRORS[error.message as keyof typeof AUTH_ERRORS] ||
      AUTH_ERRORS.default
    );
  }

  // Si c'est une chaîne d'erreur directe
  if (typeof error === "string") {
    return AUTH_ERRORS[error as keyof typeof AUTH_ERRORS] || error;
  }

  return AUTH_ERRORS.default;
};
