import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TenantAdmin {
    id: string;
    name: string;
    phoneNumber: string;
    createdAt: string;
    daysRemaining: number;
    completedConfiguration: boolean;
    whatsAppLink: string;
    magicLinkUrl?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private apiUrl = `${environment.apiUrl}/Admin`;

    constructor(private http: HttpClient) { }

    getTenants(): Observable<TenantAdmin[]> {
        return this.http.get<TenantAdmin[]>(`${this.apiUrl}/Tenants`);
    }

    deleteTenant(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/Tenants/${id}`);
    }

    createTenant(tenant: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/Tenants`, tenant);
    }
}
