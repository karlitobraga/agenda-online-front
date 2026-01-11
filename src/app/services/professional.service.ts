import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Professional {
    id: string;
    tenantId: string;
    name: string;
    photoBase64?: string;
    username: string;
    password?: string;
    showInAgenda: boolean;
    excludedOfferingIds: string[];
}

@Injectable({
    providedIn: 'root'
})
export class ProfessionalService {
    private apiUrl = environment.apiUrl + '/Professional';

    constructor(private http: HttpClient) { }

    create(tenantId: string, professional: Partial<Professional>): Observable<Professional> {
        return this.http.post<Professional>(`${this.apiUrl}/${tenantId}`, professional);
    }

    update(professional: Partial<Professional>): Observable<Professional> {
        return this.http.put<Professional>(this.apiUrl, professional);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getById(id: string): Observable<Professional> {
        return this.http.get<Professional>(`${this.apiUrl}/${id}`);
    }

    getByTenantId(tenantId: string): Observable<Professional[]> {
        return this.http.get<Professional[]>(`${this.apiUrl}/Tenant/${tenantId}`);
    }

    getPublicByTenantId(tenantId: string): Observable<Professional[]> {
        return this.http.get<Professional[]>(`${this.apiUrl}/Public/${tenantId}`);
    }
}
