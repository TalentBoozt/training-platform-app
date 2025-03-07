export const environment = {
  production: true,
  firebase: {
    apiKey: import.meta.env['NG_APP_FIREBASE_API_KEY'] || "",
    authDomain: import.meta.env['NG_APP_FIREBASE_AUTH_DOMAIN'] || "",
    projectId: import.meta.env['NG_APP_FIREBASE_PROJECT_ID'] || "",
    storageBucket: import.meta.env['NG_APP_FIREBASE_STORAGE_BUCKET'] || "",
    messagingSenderId: import.meta.env['NG_APP_FIREBASE_MESSAGING_SENDER_ID'] || "",
    appId: import.meta.env['NG_APP_FIREBASE_APP_ID'] || "",
    measurementId: import.meta.env['NG_APP_FIREBASE_MEASUREMENT_ID'] || "",
  },
  stripe_key: import.meta.env['NG_APP_STRIPE_KEY'] || "",
  apiUrl: import.meta.env['NG_APP_API_URL'] || "",
  apiUrlSimple: import.meta.env['NG_APP_API_URL_SIMPLE'] || "",
  facebookAuthConfig: {
    appId: import.meta.env['NG_APP_FACEBOOK_APP_ID'] || "",
  },
  googleAuthConfig: {
    issuer: import.meta.env['NG_APP_GOOGLE_ISSUER'] || "",
    clientId: import.meta.env['NG_APP_GOOGLE_CLIENT_ID'] || "",
    redirectUri: import.meta.env['NG_APP_GOOGLE_REDIRECT_URI'] || "",
    scope: import.meta.env['NG_APP_GOOGLE_SCOPE'] || "",
    secret: import.meta.env['NG_APP_GOOGLE_SECRET'] || "",
    responseType: import.meta.env['NG_APP_GOOGLE_RESPONSE_TYPE'] || "",
    strictDiscoveryDocumentValidation: false,
    showDebugInformation: true,
    requireHttps: false,
    allowHttp: true,
    oidc: true
  },
  githubAuthConfig: {
    clientId: import.meta.env['NG_APP_GITHUB_CLIENT_ID'] || "",
  },
  linkedinAuthConfig: {
    clientId: import.meta.env['NG_APP_LINKEDIN_CLIENT_ID'] || "",
    redirectUri: import.meta.env['NG_APP_LINKEDIN_REDIRECT_URI'] || "",
  }
};
