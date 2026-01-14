import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule, DatePipe } from '@angular/common';
import { OfferingService } from '../../offering/offering.service';
import { IOfferingResponse } from '../../offering/offering.interface';
import { ScheduleService } from '../../../services/schedule.service';
import { InfoDialogService } from '../../shared/info-dialog/info-dialog.service';
import { BookingApiService, TimeSlot } from '../../../services/booking-api.service';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-manual-booking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgxMaskDirective
  ],
  providers: [DatePipe],
  template: `
    <h2 mat-dialog-title>Novo Agendamento</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="booking-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome do Cliente</mat-label>
          <input matInput formControlName="clientName" placeholder="Ex: João Silva">
          <mat-error *ngIf="form.get('clientName')?.hasError('required')">Obrigatório</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Telefone (Opcional)</mat-label>
          <input matInput formControlName="phoneNumber" placeholder="(11) 99999-9999" mask="(00) 00000-0000">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Serviços</mat-label>
          <mat-select formControlName="offeringId" (selectionChange)="onServiceOrDateChange()" multiple>
            <mat-select-trigger>
              {{ (form.get('offeringId')?.value?.length || 0) > 0 ? (form.get('offeringId')?.value?.length + ' serviços selecionados') : '' }}
            </mat-select-trigger>
            <mat-option *ngFor="let service of services" [value]="service.id">
              {{ service.name }} - {{ service.price | currency:'BRL' }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('offeringId')?.hasError('required')">Obrigatório</mat-error>
        </mat-form-field>

        <div class="pet-fields" *ngIf="data.businessType === 'Pet Shop'">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Raça</mat-label>
            <mat-select formControlName="breed">
              <mat-option value="Cachorro">Cachorro</mat-option>
              <mat-option value="Gato">Gato</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Quantidade</mat-label>
            <input matInput type="number" formControlName="quantity" min="1">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Data</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="date" (dateChange)="onServiceOrDateChange()">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error *ngIf="form.get('date')?.hasError('required')">Obrigatório</mat-error>
        </mat-form-field>

        <!-- Slots Section -->
        <div class="slots-container" *ngIf="form.get('offeringId')?.value && form.get('date')?.value">
            <h3 class="slots-title">Horários Disponíveis</h3>
            
            <div class="loading-slots" *ngIf="loadingSlots">
                <mat-spinner diameter="30"></mat-spinner>
                <span>Buscando horários...</span>
            </div>

            <div class="empty-slots" *ngIf="!loadingSlots && availableSlots.length === 0">
                <mat-icon>event_busy</mat-icon>
                <span>Nenhum horário disponível para esta data.</span>
            </div>

            <div class="slots-grid" *ngIf="!loadingSlots && availableSlots.length > 0">
                <button type="button" 
                        *ngFor="let slot of availableSlots"
                        class="slot-btn"
                        [class.selected]="selectedSlot?.dateTime === slot.dateTime"
                        (click)="selectSlot(slot)">
                    {{ slot.timeDisplay }}
                </button>
            </div>
            <div class="error-msg" *ngIf="form.hasError('slotRequired') && form.touched">
                Selecione um horário.
            </div>
        </div>

      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid || !selectedSlot || loading" (click)="save()">
        {{ loading ? 'Salvando...' : 'Agendar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 8px; }
    .booking-form { display: flex; flex-direction: column; gap: 8px; padding-top: 8px; }
    
    .slots-container {
        margin-top: 8px;
        border-top: 1px solid #e2e8f0;
        padding-top: 16px;

        .slots-title {
            font-size: 1rem;
            font-weight: 600;
            color: #334155;
            margin: 0 0 12px 0;
        }

        .loading-slots, .empty-slots {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            color: #64748b;
            background: #f8fafc;
            border-radius: 8px;
            justify-content: center;
        }

        .slots-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 10px;
            max-height: 200px;
            overflow-y: auto;
            padding-right: 4px;

            .slot-btn {
                background: white;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                padding: 10px 0;
                font-weight: 600;
                color: #475569;
                cursor: pointer;
                transition: all 0.2s;

                &:hover {
                    background: #f1f5f9;
                    border-color: #94a3b8;
                }

                &.selected {
                    background: #667eea;
                    color: white;
                    border-color: #667eea;
                    box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.4);
                }
            }
        }
        
        .error-msg {
            color: #ef4444;
            font-size: 0.85rem;
            margin-top: 8px;
        }
    }
  `]
})
export class ManualBookingComponent implements OnInit {
  form: FormGroup;
  services: IOfferingResponse[] = [];
  availableSlots: TimeSlot[] = [];
  selectedSlot: TimeSlot | null = null;
  loading = false;
  loadingSlots = false;

  constructor(
    private fb: FormBuilder,
    private offeringService: OfferingService,
    private scheduleService: ScheduleService,
    private bookingApi: BookingApiService,
    private dialogRef: MatDialogRef<ManualBookingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tenantId: string, slug: string, businessType?: string },
    private dialogService: InfoDialogService
  ) {
    this.form = this.fb.group({
      clientName: ['', Validators.required],
      phoneNumber: ['', [Validators.pattern(/^\d{10,11}$/)]],
      offeringId: ['', Validators.required],
      date: [new Date(), Validators.required],
      breed: [''],
      quantity: [1]
    });
  }

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices() {
    this.offeringService.GetAll(this.data.tenantId).subscribe({
      next: (res) => this.services = res,
      error: (err) => console.error('Error loading services', err)
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onServiceOrDateChange() {
    const offeringIds = this.form.get('offeringId')?.value;
    const date = this.form.get('date')?.value;

    if (offeringIds && offeringIds.length > 0 && date) {
      this.loadSlots(offeringIds, date);
    }
  }

  loadSlots(serviceIds: string[], date: Date) {
    this.loadingSlots = true;
    this.selectedSlot = null; // Clear selection
    const dateStr = this.formatDate(date);

    // If Pet Shop and multiple quantity, we need to repeat services for duration calculation
    const effectiveServiceIds: string[] = [];
    if (this.data.businessType === 'Pet Shop' && this.form.get('quantity')?.value > 1) {
      const qty = this.form.get('quantity')?.value;
      for (let i = 0; i < qty; i++) {
        effectiveServiceIds.push(...serviceIds);
      }
    } else {
      effectiveServiceIds.push(...serviceIds);
    }

    this.bookingApi.getAvailableSlots(this.data.slug, dateStr, effectiveServiceIds).subscribe({
      next: (slots) => {
        this.availableSlots = slots;
        this.loadingSlots = false;
      },
      error: (err) => {
        console.error('Error loading slots', err);
        this.availableSlots = [];
        this.loadingSlots = false;
      }
    });
  }

  selectSlot(slot: TimeSlot) {
    this.selectedSlot = slot;
  }

  save() {
    if (this.form.invalid || !this.selectedSlot) return;

    this.loading = true;
    const val = this.form.value;

    const payload: any = {
      tenantId: this.data.tenantId,
      clientName: val.clientName,
      phoneNumber: val.phoneNumber || null,
      offeringIds: val.offeringId,
      date: this.selectedSlot.dateTime
    };

    if (this.data.businessType === 'Pet Shop') {
      payload.petItems = [{
        name: val.clientName, // Default to client name for manual
        breed: val.breed || 'Cachorro',
        quantity: val.quantity || 1,
        serviceIds: val.offeringId
      }];
    }

    // Use scheduleService directly like before, but now with confirmed slot
    this.scheduleService.add(payload).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error saving schedule', err);
        const errorMessage = typeof err.error === 'string' ? err.error : 'Erro ao salvar agendamento. O horário pode ter sido ocupado recentemente.';
        this.dialogService.showMessage(errorMessage, false);
      }
    });
  }
}
