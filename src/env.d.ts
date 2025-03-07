// Define the type of the environment variables.
declare interface Env {
  readonly NODE_ENV: string;
  readonly NG_APP_FIREBASE_API_KEY: string;
  readonly NG_APP_FIREBASE_AUTH_DOMAIN: string;
  readonly NG_APP_FIREBASE_PROJECT_ID: string;
  readonly NG_APP_FIREBASE_STORAGE_BUCKET: string;
  readonly NG_APP_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly NG_APP_FIREBASE_APP_ID: string;
  readonly NG_APP_FIREBASE_MEASUREMENT_ID: string;
  readonly NG_APP_STRIPE_KEY: string;
  readonly NG_APP_API_URL: string;
  readonly NG_APP_API_URL_SIMPLE: string;
  readonly NG_APP_FACEBOOK_APP_ID: string;
  readonly NG_APP_GOOGLE_ISSUER: string;
  readonly NG_APP_GOOGLE_CLIENT_ID: string;
  readonly NG_APP_GOOGLE_REDIRECT_URI: string;
  readonly NG_APP_GOOGLE_SCOPE: string;
  readonly NG_APP_GOOGLE_SECRET: string;
  readonly NG_APP_GOOGLE_RESPONSE_TYPE: string;
  readonly NG_APP_GOOGLE_STRICT_DISCOVERY: boolean;
  readonly NG_APP_GOOGLE_SHOW_DEBUG: boolean;
  readonly NG_APP_GOOGLE_REQUIRE_HTTPS: boolean;
  readonly NG_APP_GOOGLE_ALLOW_HTTP: boolean;
  readonly NG_APP_GOOGLE_OIDC: boolean;
  readonly NG_APP_GITHUB_CLIENT_ID: string;
  readonly NG_APP_LINKEDIN_CLIENT_ID: string;
  readonly NG_APP_LINKEDIN_REDIRECT_URI: string;

  [key: string]: any;
}

// Choose how to access the environment variables.
// Remove the unused options.

// 1. Use import.meta.env.YOUR_ENV_VAR in your code. (conventional)
declare interface ImportMeta {
  readonly env: Env;
}

// 2. Use _NGX_ENV_.YOUR_ENV_VAR in your code. (customizable)
// You can modify the name of the variable in angular.json.
// ngxEnv: {
//  define: '_NGX_ENV_',
// }
declare const _NGX_ENV_: Env;

// 3. Use process.env.YOUR_ENV_VAR in your code. (deprecated)
declare namespace NodeJS {
  export interface ProcessEnv extends Env {}
}
