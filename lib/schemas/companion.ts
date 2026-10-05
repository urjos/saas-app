import { z } from "zod";
import { subjects, voiceOptions, styleOptions } from "@/constants";

export const companionSchema = z.object({
  name: z.string().min(1, { message: "Companion is required." }),
  subject: z.enum(subjects, { message: "Subject is required." }),
  topic: z.string().min(1, { message: "Topic is required." }),
  voice: z.enum(voiceOptions, { message: "Voice is required." }),
  style: z.enum(styleOptions, { message: "Style is required." }),
  duration: z
    .number({ message: "Duration is required." })
    .min(1, { message: "Duration is required." }),
});

export type CompanionInput = z.infer<typeof companionSchema>;

export const companionsSearchParamsSchema = z.object({
  subject: z.string().optional().catch(undefined),
  topic: z.string().optional().catch(undefined),
  page: z.coerce.number().int().positive().optional().catch(1),
});

export type CompanionsSearchParams = z.infer<
  typeof companionsSearchParamsSchema
>;
