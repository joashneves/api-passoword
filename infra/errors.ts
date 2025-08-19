interface ServiceErrorOptions {
  cause?: Error;
  message?: string;
}

export class ServiceError extends Error {
  public action: string;
  public statusCode: number;

  constructor({ cause, message }: ServiceErrorOptions) {
    super(message || "Serviço indisponível no momento.", { cause });

    this.name = "ServiceError";
    this.action = "Verifique se o serviço está disponível.";
    this.statusCode = 503;

    // Corrige a cadeia de protótipos (necessário em TS para custom errors)
    Object.setPrototypeOf(this, ServiceError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

// Unauthorized Error
interface UnauthorizedErrorOptions {
  message?: string;
  action?: string;
}

export class UnauthorizedError extends Error {
  public action: string;
  public statusCode: number;

  constructor({ message, action }: UnauthorizedErrorOptions = {}) {
    super(message || "Usuário não autenticado");

    this.name = "UnauthorizedError";
    this.action = action || "Faça login novamente";
    this.statusCode = 401;

    // Corrige a cadeia de protótipos (necessário em TS quando estende Error)
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
