import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface ReportItem {
    id: string;
    date: string;
    clientName: string;
    phoneNumber: string;
    services: Array<{ name: string; price: number; executionTime: number }>;
    totalPrice: number;
    totalDuration: number;
}

interface ReportSummary {
    totalAppointments: number;
    totalRevenue: number;
    totalMinutes: number;
}

interface ReportResponse {
    report: ReportItem[];
    summary: ReportSummary;
}

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCardModule,
        MatProgressSpinnerModule
    ],
    providers: [DatePipe, CurrencyPipe],
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
    public startDate: Date = new Date();
    public endDate: Date = new Date();
    public report: ReportItem[] = [];
    public summary: ReportSummary | null = null;
    public loading = false;
    public tenantId: string = '';

    constructor(
        private http: HttpClient,
        private router: Router,
        private datePipe: DatePipe
    ) {
        this.tenantId = localStorage.getItem('tenantId') ?? '';
        // Default to current month
        const now = new Date();
        this.startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        this.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    ngOnInit(): void {
        this.loadReport();
    }

    loadReport(): void {
        if (!this.tenantId) return;

        this.loading = true;
        const start = this.formatDate(this.startDate);
        const end = this.formatDate(this.endDate);

        this.http.get<ReportResponse>(`${environment.apiUrl}/Reports/${this.tenantId}/billing?startDate=${start}&endDate=${end}`)
            .subscribe({
                next: (res) => {
                    this.report = res.report;
                    this.summary = res.summary;
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Erro ao carregar relatório', err);
                    this.loading = false;
                }
            });
    }

    private formatDate(date: Date): string {
        return this.datePipe.transform(date, 'yyyy-MM-dd') ?? '';
    }

    goBack(): void {
        this.router.navigate(['/inicio']);
    }
}
