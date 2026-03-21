// ─────────────────────────────────────────────────────────────
// Constants  —  frontend/src/lib/constants.js
// Shared model list for the multi-model chat selector.
// ─────────────────────────────────────────────────────────────

export const AVAILABLE_MODELS = [
  {
    name: 'gemini-2.5-flash',
    value: 'gemini-2.5-flash',
    description: 'Native Gemini 1.5 Pro API integration',
  },
  {
    name: 'Llama 3.1 8B',
    value: 'meta-llama/llama-3.1-8b-instruct',
    description: 'Good balance, fast',
  },
  {
    name: 'GPT-4o Mini',
    value: 'openai/gpt-4o-mini',
    description: 'Fast, smart, great reasoning',
  },
  {
    name: 'Mistral 7B',
    value: 'mistralai/mistral-7b-instruct',
    description: 'Very fast, small footprint',
  },
  {
    name: 'Llama 3.1 70B is very smart',
    value: 'meta-llama/llama-3.1-70b-instruct',
    description: 'Very capable large model',
  },
  {
    name: 'DeepSeek Chat',
    value: 'deepseek/deepseek-chat',
    description: 'Strong coding & math',
  },
];
