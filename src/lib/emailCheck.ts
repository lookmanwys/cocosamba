import validator from "validator";
import { isDisposable } from "@isdisposable/js";

export type EmailCheckResult =
  | { valid: true }
  | { valid: false; reason: string };

export function checkEmail(email: string): EmailCheckResult {
  const trimmed = email.trim().toLowerCase();

  // 1. Basic syntax
  if (!validator.isEmail(trimmed)) {
    return { valid: false, reason: "Please enter a valid email address." };
  }

  // 2. Block disposable / throwaway domains
  if (isDisposable(trimmed)) {
    return {
      valid: false,
      reason:
        "Disposable email addresses are not accepted. Please use a permanent email.",
    };
  }

  // 3. Block obviously fake domains
  const blockedDomains = [
    "test.com",
    "example.com",
    "fake.com",
    "tempmail.com",
    "10minutemail.com",
  ];
  const domain = trimmed.split("@")[1];
  if (blockedDomains.includes(domain)) {
    return {
      valid: false,
      reason: "Please use a real email address.",
    };
  }

  return { valid: true };
}