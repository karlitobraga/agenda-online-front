import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ICredit {
    id: string;
    tenantId: string;
    clientName: string;
    phoneNumber?: string;
    scheduleId?: string;
    originalAmount: number;
    remainingAmount: number;
    createdAt: string;
    isPaidOff: boolean;
    description?: string;
    payments: ICreditPayment[];
}

export interface ICreditPayment {
    id: string;
    creditId: string;
    amount: number;
    paidAt: string;
    paymentMethod?: string;
}

export interface ICreateCreditDto {
    clientName: string;
    phoneNumber?: string;
    scheduleId?: string;
    originalAmount: number;
    description?: string;
}

export interface IAddPaymentDto {
    amount: number;
    paymentMethod?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CreditService {
    private apiUrl = `${environment.apiUrl}/Credit`;

    constructor(private http: HttpClient) { }

    getAll(pendingOnly: boolean = false): Observable<ICredit[]> {
        return this.http.get<ICredit[]>(`${this.apiUrl}?pendingOnly=${pendingOnly}`);
    }

    getById(id: string): Observable<ICredit> {
        return this.http.get<ICredit>(`${this.apiUrl}/${id}`);
    }

    create(credit: ICreateCreditDto): Observable<ICredit> {
        return this.http.post<ICredit>(this.apiUrl, credit);
    }

    addPayment(creditId: string, payment: IAddPaymentDto): Observable<ICredit> {
        return this.http.post<ICredit>(`${this.apiUrl}/${creditId}/payment`, payment);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
