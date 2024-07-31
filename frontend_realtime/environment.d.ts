// environment.d.ts
declare global {
    namespace NodeJS {
      interface ProcessEnv {
        BASE_URL: string;
        // Add other environment variables here if needed
      }
    }
  }
  