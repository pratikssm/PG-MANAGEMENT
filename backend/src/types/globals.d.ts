declare module 'dotenv' {
  function config(options?: { path?: string }): { parsed: Record<string, string> | undefined };
  namespace config {
    export const config: typeof config;
  }
  export = config;
}

declare module 'express-rate-limit' {
  import { RequestHandler } from 'express';
  interface RateLimitOptions {
    windowMs?: number;
    max?: number | ((req: any) => number);
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
    message?: any;
    keyGenerator?: (req: any) => string;
    handler?: (req: any, res: any, next: any) => void;
  }
  const rateLimit: (options?: RateLimitOptions) => RequestHandler;
  export default rateLimit;
}
