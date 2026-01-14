import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ILoginResponse, ITenantCreateRequest } from './signup.interface';

@Injectable({
  providedIn: 'root'
})
export class SignupService {

  private baseUrl = environment.apiUrl + '/Auth';

  private tenantUrl = this.baseUrl + '/CreateTenant';

  constructor(private http: HttpClient) {
  }

  public createTenant(request: ITenantCreateRequest): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>(this.tenantUrl, request)
  }

  public updateTenant(id: string, completed: boolean) {
    return this.http.put(this.baseUrl + `/UpdateTenant/${id}`, completed)
  }
}
