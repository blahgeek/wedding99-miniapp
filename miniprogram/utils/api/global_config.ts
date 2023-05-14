export interface GlobalConfig {
  mainRichContent: string;
}

export async function requestGlobalConfig(): Promise<GlobalConfig> {
  // TODO
  const mockConfig: GlobalConfig = {
    mainRichContent: 'This is the main rich content',
  };
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockConfig);
    }, 3000);
  });
}
