import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class EvolutionService {
    // Assuming environment.apiUrl exists or we use relative path if proxy is set up.
    // Given the backend controller is [Route("api/[controller]")], the URL is /api/Evolution/qrcode
    private apiUrl = `${environment.apiUrl}/Evolution`;

    constructor(private http: HttpClient) { }

    getQrCode(tenantId: string): Observable<{ qrcode: string }> {
        return this.http.get<{ qrcode: string }>(`${this.apiUrl}/qrcode/${tenantId}`);
    }

    checkConnectionStatus(tenantId: string): Observable<{ connected: boolean; instanceName: string }> {
        return this.http.get<{ connected: boolean; instanceName: string }>(`${this.apiUrl}/status/${tenantId}`, {
            headers: { 'X-Skip-Loader': 'true' }
        });
    }
}
