export {};

declare global {
  interface Window {
    offertrack?: {
      desktop: boolean;
      data: {
        exportBackup: () => Promise<{ canceled?: boolean; filePath?: string; count?: number }>;
        importBackup: () => Promise<{ canceled?: boolean; count?: number }>;
        openFolder: () => Promise<{ result: string; folder: string }>;
      };
    };
  }
}
