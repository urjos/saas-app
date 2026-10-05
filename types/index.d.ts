// type User = {
//   name: string;
//   email: string;
//   image?: string;
//   accountId: string;
// };

type Subject = (typeof import("@/constants").subjects)[number];
type VoiceOption = (typeof import("@/constants").voiceOptions)[number];
type StyleOption = (typeof import("@/constants").styleOptions)[number];

type Companion = Omit<
  import("@/types/database.types").Tables<"companions">,
  "subject" | "voice" | "style"
> & {
  subject: Subject;
  voice: VoiceOption;
  style: StyleOption;
  bookmarked?: boolean;
};

type GetAllCompanions = Partial<Pick<Companion, "topic">> & {
  limit?: number;
  page?: number;
  subject?: Subject | string;
};

interface BuildClient {
  key?: string;
  sessionToken?: string;
}

interface CreateUser {
  email: string;
  name: string;
  image?: string;
  accountId: string;
}

interface SearchParams {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface Avatar {
  userName: string;
  width: number;
  height: number;
  className?: string;
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

type CompanionComponentProps = Pick<
  Companion,
  "subject" | "topic" | "name"
> & {
  companionId: string;
  userName: string;
  userImage: string;
  voice: string;
  style: string;
};