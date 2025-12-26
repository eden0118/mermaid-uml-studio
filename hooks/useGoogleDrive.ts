import { useState, useEffect, useCallback } from 'react';
import { SCOPES, DISCOVERY_DOCS, MARKDOWN_MIME } from '@/lib/constants';
import { FileData } from '@/types/types';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export const useGoogleDrive = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isDriveConnected, setIsDriveConnected] = useState(false);

  // NOTE: In a real app, these come from env vars.
  // We use placeholder logic here. If these are empty, Drive features won't fully work without user config.
  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';

  useEffect(() => {
    const loadGapi = async () => {
      if (!CLIENT_ID || !API_KEY) {
        console.warn('Google Client ID or API Key missing. Drive integration disabled.');
        return;
      }

      try {
        await new Promise<void>((resolve) => {
          if (window.gapi) {
            window.gapi.load('client', resolve);
          } else {
            // simple retry or fail silently
            resolve();
          }
        });

        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: DISCOVERY_DOCS,
        });

        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              setAccessToken(tokenResponse.access_token);
              setIsDriveConnected(true);
            }
          },
        });

        setTokenClient(client);
        setIsInitialized(true);
      } catch (err) {
        console.error('Error initializing Google Drive API', err);
      }
    };

    // Check if scripts are loaded
    const checkScripts = setInterval(() => {
      if (typeof window.google !== 'undefined' && typeof window.gapi !== 'undefined') {
        clearInterval(checkScripts);
        loadGapi();
      }
    }, 500);

    return () => clearInterval(checkScripts);
  }, [CLIENT_ID, API_KEY]);

  const login = useCallback(() => {
    if (!tokenClient) {
      alert('Google Drive API not configured. Please add CLIENT_ID and API_KEY to env.');
      return;
    }
    // Skip prompt if we already have a token, effectively
    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  }, [tokenClient]);

  const saveFileToDrive = async (fileName: string, content: string): Promise<void> => {
    if (!accessToken) throw new Error('Not logged in');

    // Metadata
    const fileMetadata = {
      name: fileName,
      mimeType: MARKDOWN_MIME,
    };

    // Multipart upload body
    const boundary = '-------314159265358979323846';
    const delimiter = '\r\n--' + boundary + '\r\n';
    const close_delim = '\r\n--' + boundary + '--';

    const data = content;
    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(fileMetadata) +
      delimiter +
      'Content-Type: ' +
      MARKDOWN_MIME +
      '\r\n\r\n' +
      data +
      close_delim;

    try {
      await window.gapi.client.request({
        path: '/upload/drive/v3/files',
        method: 'POST',
        params: { uploadType: 'multipart' },
        headers: {
          'Content-Type': 'multipart/related; boundary="' + boundary + '"',
        },
        body: multipartRequestBody,
      });
      alert('File saved to Google Drive!');
    } catch (e) {
      console.error('Upload error', e);
      throw new Error('Failed to upload to Drive');
    }
  };

  const pickFile = async (): Promise<FileData | null> => {
    if (!accessToken) return null;

    return new Promise((resolve, reject) => {
      const view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
      view.setMimeTypes(MARKDOWN_MIME + ',text/plain');

      const picker = new window.google.picker.PickerBuilder()
        .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
        .setOAuthToken(accessToken)
        .addView(view)
        .setCallback(async (data: any) => {
          if (data.action === window.google.picker.Action.PICKED) {
            const fileId = data.docs[0].id;
            const name = data.docs[0].name;

            try {
              const response = await window.gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media',
              });
              resolve({
                id: fileId,
                name: name,
                content: response.body,
              });
            } catch (e) {
              reject(e);
            }
          } else if (data.action === window.google.picker.Action.CANCEL) {
            resolve(null);
          }
        })
        .build();
      picker.setVisible(true);
    });
  };

  return {
    isInitialized,
    isDriveConnected,
    login,
    saveFileToDrive,
    pickFile,
  };
};

export default useGoogleDrive;
