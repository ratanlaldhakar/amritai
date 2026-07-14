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

  /**
   * Helper to clean phone numbers to contain only digits as required by Meta Cloud API
   */
  private cleanPhoneNumber(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/${this.phoneId}/${endpoint}`;

    // Setup headers
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...((options.headers || {}) as Record<string, string>),
    };

    // Filter payload and headers for logs (hide token)
    let requestPayload: any = null;
    try {
      if (options.body) {
        requestPayload = JSON.parse(options.body as string);
      }
    } catch {
      requestPayload = options.body;
    }

    const requestHeadersLogged = { ...headers };
    if (requestHeadersLogged.Authorization) {
      requestHeadersLogged.Authorization = 'Bearer [REDACTED]';
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (fetchErr: any) {
      // Log complete fetch network error object
      logger.error('WhatsApp API Fetch Network Exception:', {
        requestUrl: url,
        requestPayload,
        requestHeaders: requestHeadersLogged,
        fetchError: {
          message: fetchErr?.message,
          name: fetchErr?.name,
          stack: fetchErr?.stack,
          code: fetchErr?.code,
          cause: fetchErr?.cause,
        },
      });
      throw fetchErr;
    }

    // Collect response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((val, key) => {
      responseHeaders[key] = val;
    });

    const rawText = await response.text();
    let responseData: any = {};
    try {
      if (rawText) {
        responseData = JSON.parse(rawText);
      }
    } catch {
      logger.warn('WhatsApp API response was not valid JSON:', { rawText });
    }

    if (!response.ok) {
      const errorMsg = responseData?.error?.message || response.statusText || 'Unknown error';
      const errorCode = responseData?.error?.code;
      const errorSubcode = responseData?.error?.error_subcode;
      const errorData = responseData?.error?.error_data;

      // Log the COMPLETE Meta response before throwing
      logger.error('WhatsApp API Request Failed - Error details:', {
        httpStatus: response.status,
        statusText: response.statusText,
        requestUrl: url,
        requestPayload,
        responseHeaders,
        responseBody: rawText,
        metaError: {
          message: errorMsg,
          code: errorCode,
          error_subcode: errorSubcode,
          error_data: errorData,
        },
      });

      // Construct a specific error object containing all details
      const apiError = new Error(
        `WhatsApp API Error [${response.status}]: ${errorMsg} (Code: ${errorCode}, Subcode: ${errorSubcode})`
      );
      (apiError as any).httpStatus = response.status;
      (apiError as any).statusText = response.statusText;
      (apiError as any).requestUrl = url;
      (apiError as any).requestPayload = requestPayload;
      (apiError as any).responseHeaders = responseHeaders;
      (apiError as any).responseBody = rawText;
      (apiError as any).metaError = responseData?.error;

      throw apiError;
    }

    return responseData as T;
  }

  /**
   * Send a standard text message
   */
  async sendText({ to, text, previewUrl = false }: WhatsAppTextMessage) {
    const cleanTo = this.cleanPhoneNumber(to);
    logger.info(`Sending WhatsApp text message to: ${cleanTo}`);
    return this.request('messages', {
      method: 'POST',
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanTo,
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
   * Send a standard message (additional alias)
   */
  async sendMessage(to: string, text: string) {
    return this.sendTextMessage(to, text);
  }

  /**
   * Send a template message
   */
  async sendTemplate({ to, templateName, languageCode, components }: WhatsAppTemplateMessage) {
    const cleanTo = this.cleanPhoneNumber(to);
    logger.info(`Sending WhatsApp template (${templateName}) to: ${cleanTo}`);
    return this.request('messages', {
      method: 'POST',
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanTo,
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
    const cleanTo = this.cleanPhoneNumber(to);
    logger.info(`Sending WhatsApp buttons to: ${cleanTo}`);

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
        to: cleanTo,
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
    const cleanTo = this.cleanPhoneNumber(to);
    logger.info(`Replying to WhatsApp message ${messageId} for user ${cleanTo}`);
    return this.request('messages', {
      method: 'POST',
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanTo,
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
