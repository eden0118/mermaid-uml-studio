export interface FileData {
  id?: string;
  name: string;
  content: string;
}

export enum SaveLocation {
  LOCAL = 'LOCAL',
  DRIVE = 'DRIVE',
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SAVING = 'SAVING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export interface GoogleDriveConfig {
  clientId: string;
  apiKey: string;
}

// Minimal type definition for the global gapi object if needed,
// though we usually rely on window.gapi generic access or @types/gapi
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
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
