import { z } from 'zod';

export const QuestionTaskDetailSchema = z.object({
  type: z.literal('question'),
  questionRichContent: z.string(),
  answers: z.array(z.string()),
  correctAnswer: z.number(),
  explanation: z.string(),
});

export type QuestionTaskDetail = z.infer<typeof QuestionTaskDetailSchema>;

export const PhotoTaskDetailSchema = z.object({
  type: z.literal('photo'),
  requiredFaceCount: z.number(),
});

export type PhotoTaskDetail = z.infer<typeof PhotoTaskDetailSchema>;

export const HuntTaskSchema = z.object({
  id: z.string(),
  defaultLocked: z.boolean(),
  taskDetail: z.union([QuestionTaskDetailSchema, PhotoTaskDetailSchema]),
});

export type HuntTask = z.infer<typeof HuntTaskSchema>;
