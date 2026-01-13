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
        MatCardModule
    ],
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
    constructor(
        private router: Router
    ) { }

    ngOnInit(): void { }

    navigateTo(type: string): void {
        this.router.navigate([`/settings/reports/${type}`]);
    }

    goBack(): void {
        this.router.navigate(['/inicio']);
    }
}
