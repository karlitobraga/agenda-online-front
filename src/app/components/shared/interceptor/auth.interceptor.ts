import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, delay, finalize, throwError } from 'rxjs';
import { LoaderService } from '../loader/loader.service';
import { InfoDialogService } from '../info-dialog/info-dialog.service';

export const appInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const loaderService = inject(LoaderService);
  const router = inject(Router);
  const infoDialogService = inject(InfoDialogService);

  const skipLoader = req.headers.has('X-Skip-Loader');

  if (!skipLoader) {
    loaderService.show();
  }

  // recupera token do localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // adiciona headers padrão e remove header auxiliar
  let headers = req.headers.delete('X-Skip-Loader');

  if (!headers.has('Accept')) {
    headers = headers.set('Accept', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  const modifiedReq = req.clone({ headers });

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/Evolution/')) {
        // limpa o token e redireciona sem mostrar modal
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('tenantId');
        }
        router.navigate(['/login']);
      } else {
        // exibe modal com mensagem de erro
        const message =
          error.error?.message ||
          error.error ||
          'Ocorreu um erro inesperado. Tente novamente.';
        infoDialogService.showMessage(message, false);
      }

      return throwError(() => error);
    }),
    finalize(() => {
      if (!skipLoader) {
        loaderService.hide();
      }
    })
  );
};
