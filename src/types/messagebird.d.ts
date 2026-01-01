declare module 'messagebird' {
  // Definizione errore generico MessageBird
  export interface MBError {
    code: number;
    description: string;
    parameter?: string;
  }

  export interface MBErrorResponse {
    errors: MBError[];
  }

  // Definizione risposta creazione messaggio
  export interface MBMessageResponse {
    id: string;
    href: string;
    direction: string;
    type: string;
    originator: string;
    body: string;
    reference: string | null;
    validity: number | null;
    gateway: number | null;
    typeDetails: Record<string, unknown>;
    datacoding: string;
    mclass: number;
    scheduledDatetime: string | null;
    createdDatetime: string;
    recipients: {
      totalCount: number;
      totalSentCount: number;
      totalDeliveredCount: number;
      totalDeliveryFailedCount: number;
      items: Array<{
        recipient: number;
        status: string;
        statusDatetime: string;
      }>;
    };
  }

  // Definizione risposta bilancio
  export interface MBBalance {
    payment: string;
    type: string;
    amount: string;
  }

  interface MessageBirdClient {
    messages: {
      create: (
        params: {
          originator: string;
          recipients: string[];
          body: string;
        },
        callback: (err: Error | MBErrorResponse | null, response: MBMessageResponse) => void
      ) => void;
    };
    balance: {
      read: (callback: (err: Error | MBErrorResponse | null, data: MBBalance) => void) => void;
    };
  }

  function messagebird(apiKey: string): MessageBirdClient;
  export = messagebird;
}