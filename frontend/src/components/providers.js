// Canonical provider config used across all components
export const PROVIDERS = [
  {
    key:   'openai',
    name:  'OpenAI',
    pkg:   'openai',
    repo:  'openai/openai-python',
    color: '#10a37f',
    emoji: '🟢',
  },
  {
    key:   'anthropic',
    name:  'Anthropic',
    pkg:   'anthropic',
    repo:  'anthropics/anthropic-sdk-python',
    color: '#d97706',
    emoji: '🟠',
  },
  {
    key:   'google',
    name:  'Google',
    pkg:   'google-generativeai',
    repo:  'google-gemini/generative-ai-python',
    color: '#4285f4',
    emoji: '🔵',
  },
  {
    key:   'mistral',
    name:  'Mistral',
    pkg:   'mistralai',
    repo:  'mistralai/client-python',
    color: '#FF7000',
    emoji: '🔶',
  },
  {
    key:   'huggingface',
    name:  'HuggingFace',
    pkg:   'huggingface-hub',
    repo:  'huggingface/transformers',
    color: '#FFD21E',
    emoji: '🤗',
  },
  {
    key:   'groq',
    name:  'Groq',
    pkg:   'groq',
    repo:  null,
    color: '#f55036',
    emoji: '⚡',
  },
  {
    key:   'cohere',
    name:  'Cohere',
    pkg:   'cohere',
    repo:  null,
    color: '#39d353',
    emoji: '🌿',
  },
  {
    key:   'ollama',
    name:  'Ollama',
    pkg:   'ollama',
    repo:  'ollama/ollama',
    color: '#7c3aed',
    emoji: '🦙',
  },
  {
    key:   'replicate',
    name:  'Replicate',
    pkg:   'replicate',
    repo:  null,
    color: '#ec4899',
    emoji: '🎯',
  },
  {
    key:   'together',
    name:  'Together',
    pkg:   'together',
    repo:  null,
    color: '#06b6d4',
    emoji: '🤝',
  },
]

export const PROVIDER_MAP = Object.fromEntries(PROVIDERS.map(p => [p.key, p]))
export const BY_PKG  = Object.fromEntries(PROVIDERS.map(p => [p.pkg,  p]))
export const BY_REPO = Object.fromEntries(
  PROVIDERS.filter(p => p.repo).map(p => [p.repo, p])
)
