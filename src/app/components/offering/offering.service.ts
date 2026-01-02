import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IOfferingResponse } from './offering.interface';

@Injectable({
  providedIn: 'root'
})
export class OfferingService {
  baseUrl = environment.apiUrl + '/Offering'
  constructor(private http: HttpClient) { }

  public GetAll(tenantId: string): Observable<IOfferingResponse[]> {
    return this.http.get<IOfferingResponse[]>(this.baseUrl + `/${tenantId}`);
  }

  public updateOffering(offering: IOfferingResponse) {
    return this.http.put(this.baseUrl, offering)
  }

  public insertOferring(offering: IOfferingResponse) {
    return this.http.post(this.baseUrl, offering)
  }

  public deleteOffering(id: string) {
    return this.http.delete(this.baseUrl + `/${id}`)
  }
}
