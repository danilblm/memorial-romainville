import { Archive, BookOpen, HelpCircle, MessagesSquare, Search } from "lucide-react";
import { PostKind } from "../../types/Community";

// Une icône par type de publication
export const KIND_ICONS: Record<PostKind, typeof Archive> = {
  discussion: MessagesSquare,
  question: HelpCircle,
  archive: Archive,
  souvenir: BookOpen,
  recherche: Search,
};
