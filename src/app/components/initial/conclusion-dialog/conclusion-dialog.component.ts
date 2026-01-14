import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { OfferingService } from '../../offering/offering.service';
import { ISchedule, ScheduleService } from '../../../services/schedule.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { CreditService } from '../../../services/credit.service';

@Component({
    selector: 'app-conclusion-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatDividerModule,
        MatFormFieldModule,
        MatSelectModule,
        MatRadioModule,
        FormsModule
    ],
    templateUrl: './conclusion-dialog.component.html',
    styleUrl: './conclusion-dialog.component.scss'
})
export class ConclusionDialogComponent implements OnInit {
    public allOfferings: any[] = [];
    public selectedOfferings: any[] = [];
    public newOfferingId: string = '';
    public paymentMethod: string = 'Dinheiro';
    public paymentMethods: string[] = ['Dinheiro', 'Cartão Débito', 'Cartão Crédito', 'Pix', 'Fiado'];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { schedule: ISchedule, tenantId: string },
        private dialogRef: MatDialogRef<ConclusionDialogComponent>,
        private offeringService: OfferingService,
        private scheduleService: ScheduleService,
        private creditService: CreditService
    ) {
        // Clone offerings to avoid direct mutation
        this.selectedOfferings = [...(data.schedule.offerings || [])];
    }

    ngOnInit(): void {
        this.loadAllOfferings();
    }

    loadAllOfferings() {
        this.offeringService.GetAll(this.data.tenantId).subscribe({
            next: (data: any[]) => this.allOfferings = data,
            error: (err: any) => console.error('Erro ao carregar serviços', err)
        });
    }

    addOffering() {
        if (!this.newOfferingId) return;
        const offering = this.allOfferings.find(o => o.id === this.newOfferingId);
        if (offering && !this.selectedOfferings.some(o => o.id === offering.id)) {
            this.selectedOfferings.push(offering);
            this.newOfferingId = '';
        }
    }

    removeOffering(id: string) {
        this.selectedOfferings = this.selectedOfferings.filter(o => o.id !== id);
    }

    getTotalPrice(): number {
        return this.selectedOfferings.reduce((sum, o) => sum + (o.price || 0), 0);
    }

    confirm() {
        // Prepare updated schedule DTO for backend
        const updateDto = {
            tenantId: this.data.schedule.tenantId,
            phoneNumber: this.data.schedule.phoneNumber,
            clientName: this.data.schedule.clientName,
            date: this.data.schedule.date,
            offeringIds: this.selectedOfferings.map(o => o.id),
            clientId: (this.data.schedule as any).clientId
        };

        // Update first, then complete
        this.scheduleService.update(this.data.schedule.id, updateDto).subscribe({
            next: () => {
                this.scheduleService.markAsCompleted(this.data.schedule.id).subscribe({
                    next: () => {
                        // If payment is Fiado, create a credit
                        if (this.paymentMethod === 'Fiado') {
                            this.createCredit();
                        } else {
                            this.dialogRef.close(true);
                        }
                    },
                    error: (err: any) => console.error('Erro ao concluir agendamento', err)
                });
            },
            error: (err: any) => console.error('Erro ao atualizar serviços', err)
        });
    }

    private createCredit() {
        const creditDto = {
            clientName: this.data.schedule.clientName,
            phoneNumber: this.data.schedule.phoneNumber,
            scheduleId: this.data.schedule.id,
            originalAmount: this.getTotalPrice(),
            description: 'Fiado gerado ao concluir agendamento'
        };

        this.creditService.create(creditDto).subscribe({
            next: () => this.dialogRef.close(true),
            error: (err: any) => {
                console.error('Erro ao criar fiado', err);
                this.dialogRef.close(true); // Still close, schedule was completed
            }
        });
    }

    cancel() {
        this.dialogRef.close(false);
    }
}

