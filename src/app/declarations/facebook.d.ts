declare global {
  interface Window {
    fbAsyncInit: () => void;
  }

  const FB: {
    init: (params: {
      appId: string;
      cookie: boolean;
      xfbml: boolean;
      version: string;
    }) => void;
    login: (callback: (response: any) => void, options?: { scope: string }) => void;
    api: (
      path: string,
      params: any,
      callback: (response: any) => void
    ) => void;
  };
}

export {};
