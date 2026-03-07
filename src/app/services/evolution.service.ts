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

    private statusCache: { [tenantId: string]: { connected: boolean; instanceName: string; timestamp: number } } = {};

    constructor(private http: HttpClient) { }

    getQrCode(tenantId: string): Observable<{ qrcode: string }> {
        return this.http.get<{ qrcode: string }>(`${this.apiUrl}/qrcode/${tenantId}`);
    }

    checkConnectionStatus(tenantId: string, force: boolean = false): Observable<{ connected: boolean; instanceName: string }> {
        const cached = this.statusCache[tenantId];
        const now = Date.now();

        // Use cache if it's less than 30 seconds old and we're not forcing a refresh
        if (!force && cached && (now - cached.timestamp < 30000)) {
            return new Observable(observer => {
                observer.next({ connected: cached.connected, instanceName: cached.instanceName });
                observer.complete();
            });
        }

        return new Observable(observer => {
            this.http.get<{ connected: boolean; instanceName: string }>(`${this.apiUrl}/status/${tenantId}`, {
                headers: { 'X-Skip-Loader': 'true' }
            }).subscribe({
                next: (res) => {
                    this.statusCache[tenantId] = { ...res, timestamp: now };
                    observer.next(res);
                    observer.complete();
                },
                error: (err) => {
                    observer.error(err);
                }
            });
        });
    }
}
