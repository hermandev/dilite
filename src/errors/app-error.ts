export class AppError extends Error {
  constructor(
    public message: string,
    public code: string = "APP_ERROR",
    public status: number = 400,
  ) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 422);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, "NOT_FOUND", 404);
  }
}
