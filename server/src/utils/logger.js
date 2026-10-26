/**
 * Simple structured console logger for InternTrack
 */
export const logger = {
  info: (msg, meta = '') => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, meta ? meta : ''),
  warn: (msg, meta = '') => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, meta ? meta : ''),
  error: (msg, err = '') => {
    // Avoid logging sensitive tokens or passwords
    const safeError = err instanceof Error ? { message: err.message, stack: err.stack } : err;
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, safeError ? safeError : '');
  },
  debug: (msg, meta = '') => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${msg}`, meta ? meta : '');
    }
  }
};
