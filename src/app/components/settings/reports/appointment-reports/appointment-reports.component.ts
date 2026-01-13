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
import { environment } from '../../../../../environments/environment';

interface ReportItem {
    id: string;
    date: string;
    clientName: string;
    professionalName: string;
    description: string;
    value: number;
    type: string;
}

interface ReportSummary {
    totalAppointments: number;
    totalRevenue: number;
    serviceRevenue: number;
}

@Component({
    selector: 'app-appointment-reports',
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
    templateUrl: './appointment-reports.component.html',
    styleUrl: './appointment-reports.component.scss'
})
export class AppointmentReportsComponent implements OnInit {
    startDate: Date = new Date();
    endDate: Date = new Date();
    report: ReportItem[] = [];
    summary: any = null;
    loading = false;
    tenantId: string = '';

    constructor(
        private http: HttpClient,
        private router: Router,
        private datePipe: DatePipe
    ) {
        this.tenantId = localStorage.getItem('tenantId') ?? '';
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
        const start = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
        const end = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');

        this.http.get<any>(`${environment.apiUrl}/Reports/${this.tenantId}/billing?startDate=${start}&endDate=${end}`)
            .subscribe({
                next: (res) => {
                    // Filter only services
                    this.report = res.report.filter((item: any) => item.type === 'Serviço');
                    this.summary = res.summary;
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Erro ao carregar relatório', err);
                    this.loading = false;
                }
            });
    }

    goBack(): void {
        this.router.navigate(['/inicio']);
    }
}
