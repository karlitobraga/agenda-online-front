import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ITenantLoginRequest } from './login.interface';
import { environment } from '../../../environments/environment';
import { ITenant } from '../signup/signup.interface';

export interface LoginResponse {
  token: string;
  expiresAt: Date;
  tenantId: string;
  professionalId?: string;
  subscriptionStatus: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private baseUrl = environment.apiUrl + '/Auth';

  private loginUrl = this.baseUrl + '/Login';

  private tenantUrl = this.baseUrl + '/Tenant/';

  constructor(private http: HttpClient) {
  }

  public login(request: ITenantLoginRequest): Observable<LoginResponse> { // Changed ILoginResponse to LoginResponse based on definition
    return this.http.post<LoginResponse>(this.loginUrl, request).pipe(
      tap((response: LoginResponse) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('tenantId', response.tenantId);
        if (response.professionalId) {
          localStorage.setItem('professionalId', response.professionalId);
        } else {
          localStorage.removeItem('professionalId');
        }
        localStorage.setItem('subscriptionStatus', response.subscriptionStatus);
      })
    );
  }

  public getTenant(id: string): Observable<ITenant> {
    return this.http.get<ITenant>(this.tenantUrl + id)
  }
}
