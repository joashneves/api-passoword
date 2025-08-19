interface ErrorParams {
  cause?: Error;
  message?: string;
  action?: string;
}

export class ServiceError extends Error {
  public action: string;
  public statusCode: number;

  constructor({ cause, message }: ErrorParams) {
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
export class UnauthorizedError extends Error {
  public action: string;
  public statusCode: number;

  constructor({ message, action }: ErrorParams = {}) {
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

export class ValidationError extends Error {
  action: string;
  statusCode: number;

  constructor({ message, action }: ErrorParams) {
    super(message || "Erro de validação ocorreu.");
    this.name = "ValidationError";
    this.action = action || "Verifique os dados enviados.";
    this.statusCode = 409;

    // Corrige prototype para instanceof funcionar corretamente
    Object.setPrototypeOf(this, ValidationError.prototype);
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

export class NotFoundError extends Error {
  action: string;
  statusCode: number;

  constructor({ message, action }: ErrorParams) {
    super(message || "Não foi possivel encontrar este recurso no sistema");
    this.name = "NotFoundError";
    this.action =
      action || "Verifique se os parâmetros enviados na consulta estão certos";
    this.statusCode = 404;

    Object.setPrototypeOf(this, NotFoundError.prototype);
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
