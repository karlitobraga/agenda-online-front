import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CreditService, ICredit } from '../../../services/credit.service';
import { CreditPaymentDialogComponent } from './credit-payment-dialog/credit-payment-dialog.component';

@Component({
    selector: 'app-credits',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatDialogModule
    ],
    templateUrl: './credits.component.html',
    styleUrl: './credits.component.scss'
})
export class CreditsComponent implements OnInit {
    credits: ICredit[] = [];
    loading = false;
    showPaidOff = false;

    constructor(
        private creditService: CreditService,
        private router: Router,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.loadCredits();
    }

    loadCredits(): void {
        this.loading = true;
        this.creditService.getAll(!this.showPaidOff).subscribe({
            next: (data) => {
                this.credits = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Erro ao carregar fiados', err);
                this.loading = false;
            }
        });
    }

    toggleShowPaidOff(): void {
        this.showPaidOff = !this.showPaidOff;
        this.loadCredits();
    }

    getTotalPending(): number {
        return this.credits.filter(c => !c.isPaidOff).reduce((sum, c) => sum + c.remainingAmount, 0);
    }

    addPayment(credit: ICredit): void {
        const dialogRef = this.dialog.open(CreditPaymentDialogComponent, {
            width: '400px',
            data: { credit }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadCredits();
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/inicio']);
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('pt-BR');
    }

    formatPhone(phone: string | undefined): string {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
        }
        return phone;
    }
}
