/**
 * logger.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * VULN-010 FIX: Production-safe logger.
 *
 * In development (__DEV__ === true), logs pass through to the console as usual.
 * In production builds (__DEV__ === false, which Metro sets at bundle time),
 * ALL logging is completely suppressed — no user PII, financial amounts, or
 * error details are ever written to device logs, ADB logcat, or crash reporters.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const logger = {
    log: (...args: unknown[]): void => {
        if (__DEV__) console.log(...args);
    },
    warn: (...args: unknown[]): void => {
        if (__DEV__) console.warn(...args);
    },
    error: (...args: unknown[]): void => {
        if (__DEV__) console.error(...args);
    },
    info: (...args: unknown[]): void => {
        if (__DEV__) console.info(...args);
    },
};

export default logger;
