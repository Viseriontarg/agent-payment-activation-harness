import type { ActivationErrorCode } from "./types.js";

export class ActivationError extends Error {
  readonly code: ActivationErrorCode;

  constructor(code: ActivationErrorCode, message: string) {
    super(message);
    this.name = "ActivationError";
    this.code = code;
  }
}
