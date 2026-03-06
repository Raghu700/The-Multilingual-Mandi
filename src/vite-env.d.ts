/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GROQ_API_KEY?: string;
  readonly VITE_GROQ_MODEL?: string;
  readonly VITE_BEDROCK_PROXY_URL?: string;
  readonly VITE_BEDROCK_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
