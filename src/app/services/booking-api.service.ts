import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TenantPublic {
    id: string;
    name: string;
    slug: string;
    themeColor?: string;
    logoBase64?: string;
}

export interface ServicePublic {
    id: string;
    name: string;
    description?: string;
    price: number;
    durationMinutes: number;
}

export interface TimeSlot {
    dateTime: string;
    timeDisplay: string;
}

export interface BookingRequest {
    clientName: string;
    phoneNumber: string;
    serviceIds: string[];
    dateTime: string;
    professionalId?: string;
}

@Injectable({
    providedIn: 'root'
})
export class BookingApiService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getTenant(slug: string): Observable<TenantPublic> {
        return this.http.get<TenantPublic>(`${this.apiUrl}/Booking/${slug}`);
    }

    getServices(slug: string): Observable<ServicePublic[]> {
        return this.http.get<ServicePublic[]>(`${this.apiUrl}/Booking/${slug}/services`);
    }

    getAvailableSlots(slug: string, date: string, serviceIds: string[], professionalId?: string): Observable<TimeSlot[]> {
        return this.http.get<TimeSlot[]>(`${this.apiUrl}/Booking/${slug}/slots`, {
            params: { date, serviceIds, professionalId: professionalId ?? '' }
        });
    }

    createBooking(slug: string, booking: BookingRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/Booking/${slug}`, booking);
    }
}
