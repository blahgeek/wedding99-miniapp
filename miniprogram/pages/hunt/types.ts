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
  descriptionRichContent: z.string(),
  requiredFaceCount: z.number(),
  requiredUniqueFaceCount: z.number(),
});

export type PhotoTaskDetail = z.infer<typeof PhotoTaskDetailSchema>;

export const HuntTaskSchema = z.object({
  id: z.string(),
  defaultLocked: z.boolean(),
  taskDetail: z.union([QuestionTaskDetailSchema, PhotoTaskDetailSchema]),
});

export type HuntTask = z.infer<typeof HuntTaskSchema>;

export const HuntTasksSchema = z.array(HuntTaskSchema);
export type HuntTasks = z.infer<typeof HuntTasksSchema>;


export const QuestionTaskStateSchema = z.object({
  type: z.literal('question'),
});

export type QuestionTaskState = z.infer<typeof QuestionTaskStateSchema>;

export const PhotoTaskStateSchema = z.object({
  type: z.literal('photo'),
  url: z.string(),
  faces: z.array(z.string()),
});

export type PhotoTaskState = z.infer<typeof PhotoTaskStateSchema>;

export const TaskStateSchema = z.union([QuestionTaskStateSchema, PhotoTaskStateSchema]);

export type TaskState = z.infer<typeof TaskStateSchema>;
