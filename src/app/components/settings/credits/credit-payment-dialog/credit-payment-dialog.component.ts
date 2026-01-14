import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CreditService, ICredit } from '../../../../services/credit.service';

@Component({
    selector: 'app-credit-payment-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule
    ],
    templateUrl: './credit-payment-dialog.component.html',
    styleUrl: './credit-payment-dialog.component.scss'
})
export class CreditPaymentDialogComponent {
    amount: number = 0;
    paymentMethod: string = 'Dinheiro';
    paymentMethods: string[] = ['Dinheiro', 'Cartão Débito', 'Cartão Crédito', 'Pix'];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { credit: ICredit },
        private dialogRef: MatDialogRef<CreditPaymentDialogComponent>,
        private creditService: CreditService
    ) {
        // Default to remaining amount
        this.amount = data.credit.remainingAmount;
    }

    confirm(): void {
        if (this.amount <= 0 || this.amount > this.data.credit.remainingAmount) {
            return;
        }

        this.creditService.addPayment(this.data.credit.id, {
            amount: this.amount,
            paymentMethod: this.paymentMethod
        }).subscribe({
            next: () => this.dialogRef.close(true),
            error: (err) => console.error('Erro ao registrar pagamento', err)
        });
    }

    cancel(): void {
        this.dialogRef.close(false);
    }

    setFullAmount(): void {
        this.amount = this.data.credit.remainingAmount;
    }
}
