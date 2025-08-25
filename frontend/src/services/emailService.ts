import { Email, CreateEmailData, AIGenerationResponse } from '../types/email';

const API_BASE_URL = 'http://localhost:3001';

export class EmailService {
  static async getEmails(): Promise<Email[]> {
    const response = await fetch(`${API_BASE_URL}/emails`);
    if (!response.ok) {
      throw new Error('Failed to fetch emails');
    }
    return response.json();
  }

  static async getEmailById(id: number): Promise<Email> {
    const response = await fetch(`${API_BASE_URL}/emails/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch email');
    }
    return response.json();
  }

  static async createEmail(emailData: CreateEmailData): Promise<Email> {
    const response = await fetch(`${API_BASE_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });
    if (!response.ok) {
      throw new Error('Failed to create email');
    }
    return response.json();
  }

  static async updateEmail(id: number, emailData: Partial<CreateEmailData>): Promise<Email> {
    const response = await fetch(`${API_BASE_URL}/emails/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });
    if (!response.ok) {
      throw new Error('Failed to update email');
    }
    return response.json();
  }

  static async deleteEmail(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/emails/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete email');
    }
  }

  static async generateEmailWithAI(prompt: string): Promise<AIGenerationResponse> {
    const response = await fetch(`${API_BASE_URL}/ai/generate-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) {
      throw new Error('Failed to generate email with AI');
    }
    return response.json();
  }
}
