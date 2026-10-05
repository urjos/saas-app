// type User = {
//   name: string;
//   email: string;
//   image?: string;
//   accountId: string;
// };

type Subject = (typeof import("@/constants").subjects)[number];
type VoiceOption = (typeof import("@/constants").voiceOptions)[number];
type StyleOption = (typeof import("@/constants").styleOptions)[number];

interface Companion {
  id: string;
  name: string;
  subject: Subject;
  topic: string;
  voice: VoiceOption;
  style: StyleOption;
  duration: number;
  author: string;
  created_at?: string;
  bookmarked?: boolean;
}

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