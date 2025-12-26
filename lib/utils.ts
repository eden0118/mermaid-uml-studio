/**
 * 錯誤處理工具
 * ============================================
 * 統一的錯誤處理和使用者通知系統
 */

/**
 * 錯誤類型定義
 */
export enum ErrorType {
  FILE_READ = 'FILE_READ',
  FILE_SAVE = 'FILE_SAVE',
  DRIVE_AUTH = 'DRIVE_AUTH',
  DRIVE_UPLOAD = 'DRIVE_UPLOAD',
  DRIVE_DOWNLOAD = 'DRIVE_DOWNLOAD',
  RENDER = 'RENDER',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN',
}

/**
 * 錯誤訊息映射
 */
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.FILE_READ]: '無法讀取檔案，請確認檔案格式是否正確',
  [ErrorType.FILE_SAVE]: '儲存檔案失敗，請重試',
  [ErrorType.DRIVE_AUTH]: 'Google Drive 驗證失敗，請重新登入',
  [ErrorType.DRIVE_UPLOAD]: '上傳到 Google Drive 失敗，請檢查網路連線',
  [ErrorType.DRIVE_DOWNLOAD]: '從 Google Drive 下載失敗，請重試',
  [ErrorType.RENDER]: '渲染內容時發生錯誤，請檢查語法',
  [ErrorType.NETWORK]: '網路連線錯誤，請檢查您的網路狀態',
  [ErrorType.UNKNOWN]: '發生未知錯誤，請重新整理頁面',
};

/**
 * 取得使用者友善的錯誤訊息
 */
export const getErrorMessage = (type: ErrorType, details?: string): string => {
  const baseMessage = ERROR_MESSAGES[type] || ERROR_MESSAGES[ErrorType.UNKNOWN];
  return details ? `${baseMessage}\n詳細資訊：${details}` : baseMessage;
};

/**
 * 錯誤記錄器
 */
export const logError = (type: ErrorType, error: unknown, context?: string) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const logPrefix = context ? `[${context}]` : '[Error]';

  console.error(`${logPrefix} ${type}:`, {
    type,
    message: errorMessage,
    error,
    timestamp: new Date().toISOString(),
  });
};

/**
 * 統一的錯誤處理函數
 */
export const handleError = (
  type: ErrorType,
  error: unknown,
  options?: {
    context?: string;
    showAlert?: boolean;
    onError?: (message: string) => void;
  }
): string => {
  const { context, showAlert = true, onError } = options || {};

  // 記錄錯誤
  logError(type, error, context);

  // 取得錯誤訊息
  const errorMessage = getErrorMessage(
    type,
    error instanceof Error ? error.message : undefined
  );

  // 顯示通知
  if (showAlert) {
    alert(errorMessage);
  }

  // 自訂錯誤處理
  if (onError) {
    onError(errorMessage);
  }

  return errorMessage;
};

/**
 * 安全執行非同步函數
 */
export const safeAsync = async <T>(
  fn: () => Promise<T>,
  errorType: ErrorType,
  context?: string
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    handleError(errorType, error, { context });
    return null;
  }
};

/**
 * 防抖函數（用於優化效能）
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * 節流函數（用於優化效能）
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  let previous = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func(...args);
      }, remaining);
    }
  };
};
