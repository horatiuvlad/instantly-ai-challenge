export interface Email {
  id: number;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmailData {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
}

export interface AIGenerationResponse {
  subject: string;
  body: string;
  type: 'sales' | 'follow-up';
}
