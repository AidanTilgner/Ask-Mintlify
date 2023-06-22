export interface RAGConfig {
  name: string;
  description: string;
  baseURL: string;
  options: {
    [key: string]: {
      name: string;
      description: string;
      endpoint: string;
    };
  };
}
