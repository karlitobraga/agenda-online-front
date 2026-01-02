import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ISchedule {
    id: string;
    tenantId: string;
    date: string; // ISO string 2025-12-13T00:00:00
    customerName: string; // Backend maps 'ClientName' -> 'clientName' usually, but likely 'ClientName' in C#
    // Actually, C# properties are PascalCase, but default JSON serialization is camelCase.
    // Let's match what the backend sends:
    clientName: string;
    phoneNumber: string;
    offerings: Array<{
        name: string;
        price: number;
        executionTime: number; // Duration in minutes
    }>;
    start?: string; // "2025-12-13T14:00:00" or similar full date string from backend serialization
    end?: string;
    completed: boolean;
    price?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ScheduleService {

    private apiUrl = `${environment.apiUrl}/Schedule`;

    constructor(private http: HttpClient) { }

    getByDate(tenantId: string, date: string): Observable<ISchedule[]> {
        // Controller expects [HttpGet("{tenantId}/{date}")]
        // Date needs to be formatted as backend expects. Usually yyyy-MM-dd is safer for URLs if backend parses it, 
        // but C# DateTime binding in path often works with ISO. Let's try yyyy-MM-dd first as it's cleaner.
        // However, the controller signature is `DateTime date`. 
        // If I pass "2025-12-13", standard binding works.
        return this.http.get<ISchedule[]>(`${this.apiUrl}/${tenantId}/${date}`);
    }

    markAsCompleted(id: string): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/complete`, {});
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    add(schedule: any): Observable<void> {
        return this.http.post<void>(this.apiUrl, schedule);
    }
}
