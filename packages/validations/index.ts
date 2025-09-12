import { z } from "zod";

export const UserSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const CredentialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  data: z.any(),
});

export type CredentialInput = z.infer<typeof CredentialSchema>;

export const TriggerTypeEnum = z.enum(["WebHook", "Manual", "Cron"]);

export const WorkflowCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  trigger: TriggerTypeEnum,
});

export const NodeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  workflowId: z.string(),
  trigger: TriggerTypeEnum,
});
