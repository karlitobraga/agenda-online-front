import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface IProduct {
    id?: string;
    name: string;
    description?: string;
    price: number;
    cost: number;
    stock: number;
    tenantId?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = `${environment.apiUrl}/Product`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<IProduct[]> {
        return this.http.get<IProduct[]>(this.apiUrl);
    }

    getById(id: string): Observable<IProduct> {
        return this.http.get<IProduct>(`${this.apiUrl}/${id}`);
    }

    create(product: IProduct): Observable<IProduct> {
        return this.http.post<IProduct>(this.apiUrl, product);
    }

    update(id: string, product: IProduct): Observable<IProduct> {
        return this.http.put<IProduct>(`${this.apiUrl}/${id}`, product);
    }

    delete(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
