import axios from 'axios';

interface FastAPIValidationError {
  msg?: string;
  loc?: (string | number)[];
}

export function handleApiError(
  error: unknown,
  fallbackMessage = 'Ha ocurrido un error inesperado'
): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail)) {
      return detail
        .map((err: FastAPIValidationError) => err.msg || JSON.stringify(err))
        .join(', ');
    }
    if (error.response?.data?.message) {
      return String(error.response.data.message);
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallbackMessage;
}
