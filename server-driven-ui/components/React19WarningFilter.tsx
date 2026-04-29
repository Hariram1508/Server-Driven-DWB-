"use client";

import { useEffect } from "react";

const IGNORED_MESSAGES = [
  "Accessing element.ref was removed in React 19",
  "WELLDONE",
  "Wallet is not initialized",
];

export function React19WarningFilter() {
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;

    const shouldIgnore = (...args: unknown[]): boolean => {
      return args.some((arg) => {
        if (typeof arg === "string") {
          return IGNORED_MESSAGES.some((ignored) => arg.includes(ignored));
        }
        return false;
      });
    };

    console.error = (...args: unknown[]) => {
      if (shouldIgnore(...args)) {
        return;
      }
      originalError(...args);
    };

    console.warn = (...args: unknown[]) => {
      if (shouldIgnore(...args)) {
        return;
      }
      originalWarn(...args);
    };

    console.log = (...args: unknown[]) => {
      if (shouldIgnore(...args)) {
        return;
      }
      originalLog(...args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      console.log = originalLog;
    };
  }, []);

  return null;
}
