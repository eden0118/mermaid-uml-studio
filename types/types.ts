export interface FileData {
  id?: string;
  name: string;
  content: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SAVING = 'SAVING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export type Theme = 'light' | 'dark';

export type ViewMode = 'landing' | 'mermaid' | 'markdown';

export interface EditorConfig {
  fontSize: number;
  fontFamily: string; // 'mono', 'sans', 'serif'
  lineHeight: number;
}

export interface PreviewConfig {
  customCss: string;
}
