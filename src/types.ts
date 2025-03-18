// src/types.ts

// Definição do contexto do chatbot
export interface ChatbotContext {
    userName: string;
  }
  
  // Definição dos eventos possíveis
  export type ChatbotEvent =
    | { type: 'START'; name: string }
    | { type: 'ASK_QUESTION' }
    | { type: 'ANSWER'; answer: string }
    | { type: 'END' };
  