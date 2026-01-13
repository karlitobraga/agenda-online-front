import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IProduct } from './product.service';

export interface ISaleItem {
    id?: string;
    saleId?: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    product?: IProduct;
}

export interface ISale {
    id?: string;
    date?: string;
    totalAmount: number;
    tenantId?: string;
    paymentMethod?: string;
    items: ISaleItem[];
}

@Injectable({
    providedIn: 'root'
})
export class SaleService {
    private apiUrl = `${environment.apiUrl}/Sale`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<ISale[]> {
        return this.http.get<ISale[]>(this.apiUrl);
    }

    create(sale: ISale): Observable<ISale> {
        return this.http.post<ISale>(this.apiUrl, sale);
    }
}
