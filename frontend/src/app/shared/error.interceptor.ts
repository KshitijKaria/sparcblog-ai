import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from './toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError(error => {
      let message = 'An unexpected error occurred';
      if (error.error?.message) {
        message = error.error.message;
      } else if (error.status === 0) {
        message = 'Unable to connect to the server';
      } else if (error.status === 404) {
        message = 'Resource not found';
      }
      toast.error(message);
      return throwError(() => error);
    })
  );
};
