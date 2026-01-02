import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PreferenceResponse {
    initPoint: string;
    sandboxInitPoint: string;
}

@Injectable({
    providedIn: 'root'
})
export class SubscriptionService {
    private apiUrl = environment.apiUrl + '/Payment';

    constructor(private http: HttpClient) { }
    //
    createPreference(tenantId: string): Observable<PreferenceResponse> {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post<PreferenceResponse>(`${this.apiUrl}/preference`, { tenantId }, { headers });
    }
}
