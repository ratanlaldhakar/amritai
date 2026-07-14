import { env } from './env';
import { logger } from './logger';

export interface WhatsAppTextMessage {
  to: string;
  text: string;
  previewUrl?: boolean;
}

export interface WhatsAppTemplateMessage {
  to: string;
  templateName: string;
  languageCode: string;
  components?: any[];
}

export interface WhatsAppInteractiveButton {
  type: 'reply';
  reply: {
    id: string;
    title: string;
  };
}

export interface WhatsAppInteractiveMessage {
  to: string;
  bodyText: string;
  buttons: WhatsAppInteractiveButton[];
  headerText?: string;
  footerText?: string;
}

class WhatsAppClient {
  private baseUrl = 'https://graph.facebook.com/v20.0';
  private token = env.WHATSAPP_ACCESS_TOKEN;
  private phoneId = env.WHATSAPP_PHONE_NUMBER_ID;

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/${this.phoneId}/${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        logger.error('WhatsApp API Error Response:', { status: response.status, data });
        throw new Error(
          (data as any).error?.message || `WhatsApp API request failed: ${response.statusText}`
        );
      }

      return data as T;
    } catch (error) {
      logger.error('WhatsApp Fetch Exception:', {}, error);
      throw error;
    }
  }

  /**
   * Send a standard text message
   */
  async sendText({ to, text, previewUrl = false }: WhatsAppTextMessage) {
    logger.info(`Sending WhatsApp text message to: ${to}`);
    return this.request('messages', {
      method: 'POST',
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: {
          preview_url: previewUrl,
          body: text,
        },
      }),
    });
  }

  /**
   * Send a standard text message (alias required by specifications)
   */
  async sendTextMessage(to: string, text: string) {
    return this.sendText({ to, text });
  }

  /**
   * Send a template message
   */
  async sendTemplate({ to, templateName, languageCode, components }: WhatsAppTemplateMessage) {
    logger.info(`Sending WhatsApp template (${templateName}) to: ${to}`);
    return this.request('messages', {
      method: 'POST',
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
          components,
        },
      }),
    });
  }

  /**
   * Send interactive quick reply buttons
   */
  async sendButtons({ to, bodyText, buttons, headerText, footerText }: WhatsAppInteractiveMessage) {
    logger.info(`Sending WhatsApp buttons to: ${to}`);

    if (buttons.length > 3) {
      throw new Error('WhatsApp quick reply buttons are limited to a maximum of 3.');
    }

    const interactive: any = {
      type: 'button',
      body: {
        text: bodyText,
      },
      action: {
        buttons,
      },
    };

    if (headerText) {
      interactive.header = {
        type: 'text',
        text: headerText,
      };
    }

    if (footerText) {
      interactive.footer = {
        text: footerText,
      };
    }

    return this.request('messages', {
      method: 'POST',
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'interactive',
        interactive,
      }),
    });
  }

  /**
   * Mark a message as read
   */
  async markAsRead(messageId: string) {
    logger.info(`Marking WhatsApp message ${messageId} as read`);
    return this.request('messages', {
      method: 'POST',
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    });
  }

  /**
   * Mock typing indicator since Meta Cloud API does not natively support typing indicators for WhatsApp
   */
  async typingIndicator(to: string, state: boolean) {
    logger.info(`Setting WhatsApp typing indicator for ${to} to ${state}`);
    return { success: true };
  }

  /**
   * Reply to a specific incoming message ID
   */
  async reply(to: string, text: string, messageId: string) {
    logger.info(`Replying to WhatsApp message ${messageId} for user ${to}`);
    return this.request('messages', {
      method: 'POST',
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        context: {
          message_id: messageId,
        },
        type: 'text',
        text: {
          body: text,
        },
      }),
    });
  }

  /**
   * Download media file stream from Meta endpoints
   */
  async getMedia(mediaId: string): Promise<Response> {
    logger.info(`Fetching WhatsApp media details for ID: ${mediaId}`);

    // Fetch media metadata
    const response = await fetch(`${this.baseUrl}/${mediaId}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to retrieve media URL metadata: ${response.statusText}`);
    }

    const data = (await response.json()) as { url: string; mime_type: string };

    // Download the binary media stream
    return fetch(data.url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  /**
   * Verify Webhook challenge matches verify token
   */
  verifyWebhook(mode: string | null, token: string | null, expectedToken: string): boolean {
    return mode === 'subscribe' && token === expectedToken;
  }
}

export const whatsAppClient = new WhatsAppClient();
export default whatsAppClient;
