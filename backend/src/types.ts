import { z } from 'zod';

// Email DB row
export const emailSchema = z.object({
  id: z.number(),
  to: z.string(),
  cc: z.string().nullable().optional(),
  bcc: z.string().nullable().optional(),
  subject: z.string(),
  body: z.string(),
  createdAt: z.string(),
});
export type Email = z.infer<typeof emailSchema>;

// CreateEmailInput: all fields except id/createdAt, cc/bcc optional
export const createEmailInputSchema = z.object({
  to: z.string(),
  cc: z.string().nullable().optional(),
  bcc: z.string().nullable().optional(),
  subject: z.string(),
  body: z.string(),
});
export type CreateEmailInput = z.infer<typeof createEmailInputSchema>;

// DTOs
export const routeRequestSchema = z.object({
  email: createEmailInputSchema,
});
export type RouteRequest = z.infer<typeof routeRequestSchema>;

export const routeResponseSchema = z.object({
  success: z.boolean(),
  id: z.number().optional(),
  error: z.string().optional(),
});
export type RouteResponse = z.infer<typeof routeResponseSchema>;

export const generateRequestSchema = z.object({
  prompt: z.string(),
  count: z.number().min(1).max(100).optional(),
});
export type GenerateRequest = z.infer<typeof generateRequestSchema>;

// Minimal re-exports for frontend consumption (for frontend copy or shared use)
// Types and schemas are already exported above
