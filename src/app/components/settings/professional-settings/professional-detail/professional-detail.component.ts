import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ProfessionalService, Professional, IDayWeek } from '../../../../services/professional.service';
import { DayWeekService } from '../../../offering/day-week.service';
import { OfferingService } from '../../../offering/offering.service';
import { IOfferingResponse } from '../../../offering/offering.interface';
import { InfoDialogService } from '../../../shared/info-dialog/info-dialog.service';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
    selector: 'app-professional-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatDialogModule,
        MatSlideToggleModule,
        MatFormFieldModule,
        MatInputModule,
        NgxMaskDirective
    ],
    templateUrl: './professional-detail.component.html',
    styleUrls: ['./professional-detail.component.scss']
})
export class ProfessionalDetailComponent implements OnInit {
    public professionalForm: FormGroup;
    public photoPreview: string | null = null;
    public allOfferings: IOfferingResponse[] = [];
    public excludedOfferingIds: string[] = [];

    constructor(
        private fb: FormBuilder,
        private professionalService: ProfessionalService,
        private offeringService: OfferingService,
        private dayWeekService: DayWeekService,
        private dialogRef: MatDialogRef<ProfessionalDetailComponent>,
        private dialogService: InfoDialogService,
        @Inject(MAT_DIALOG_DATA) public data: Professional | null
    ) {
        this.professionalForm = this.fb.group({
            name: ['', Validators.required],
            username: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
            password: ['', Validators.required],
            showInAgenda: [true],
            daysWeek: this.fb.array([])
        });
    }

    get daysWeek(): FormArray {
        return this.professionalForm.get('daysWeek') as FormArray;
    }

    ngOnInit(): void {
        this.loadOfferings();
        if (this.data) {
            this.professionalForm.patchValue({
                name: this.data.name,
                username: this.data.username,
                password: this.data.password || '',
                showInAgenda: this.data.showInAgenda
            });
            this.photoPreview = this.data.photoBase64 ? `data:image/png;base64,${this.data.photoBase64}` : null;
            this.excludedOfferingIds = [...this.data.excludedOfferingIds];

            if (this.data.daysWeek && this.data.daysWeek.length > 0) {
                this.initDayWeekForm(this.data.daysWeek);
            } else {
                this.loadTenantDefaultHours();
            }
        } else {
            this.loadTenantDefaultHours();
        }
    }

    loadOfferings(): void {
        const tenantId = localStorage.getItem('tenantId') ?? '';
        this.offeringService.GetAll(tenantId).subscribe({
            next: (response) => {
                this.allOfferings = response;
            }
        });
    }

    loadTenantDefaultHours(): void {
        const tenantId = localStorage.getItem('tenantId') ?? '';
        this.dayWeekService.get(tenantId).subscribe({
            next: (days) => {
                this.initDayWeekForm(days);
            }
        });
    }

    initDayWeekForm(days: IDayWeek[]): void {
        const ordemDias = [
            'Segunda-feira', 'Terça-feira', 'Quarta-feira',
            'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'
        ];

        // Sort days by our custom order
        const sortedDays = [...days].sort((a, b) => ordemDias.indexOf(a.day) - ordemDias.indexOf(b.day));

        // Clear existing array if any
        while (this.daysWeek.length !== 0) {
            this.daysWeek.removeAt(0);
        }

        sortedDays.forEach(day => {
            const group = this.fb.group({
                day: [day.day],
                start: [day.start || '08:00'],
                end: [day.end || '18:00'],
                dayOff: [day.dayOff]
            });

            this.daysWeek.push(group);
        });
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.photoPreview = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    removePhoto(): void {
        this.photoPreview = null;
    }

    isExcluded(id: string): boolean {
        return this.excludedOfferingIds.includes(id);
    }

    toggleExclusion(id: string): void {
        const index = this.excludedOfferingIds.indexOf(id);
        if (index > -1) {
            this.excludedOfferingIds.splice(index, 1);
        } else {
            this.excludedOfferingIds.push(id);
        }
    }

    save(): void {
        if (this.professionalForm.invalid) return;

        const val = this.professionalForm.value;
        const tenantId = localStorage.getItem('tenantId') ?? '';

        const photoBase64 = this.photoPreview ? this.photoPreview.split(',')[1] : null;

        const payload: Partial<Professional> = {
            ...val,
            photoBase64: photoBase64,
            excludedOfferingIds: this.excludedOfferingIds
        };

        if (this.data) {
            payload.id = this.data.id;
            this.professionalService.update(payload).subscribe({
                next: () => {
                    this.dialogService.showMessage('Profissional atualizado com sucesso!', true);
                    this.dialogRef.close(true);
                },
                error: (err) => this.dialogService.showMessage('Erro ao salvar: ' + (err.error || err.message), false)
            });
        } else {
            this.professionalService.create(tenantId, payload).subscribe({
                next: () => {
                    this.dialogService.showMessage('Profissional cadastrado!', true);
                    this.dialogRef.close(true);
                },
                error: (err) => this.dialogService.showMessage('Erro ao cadastrar: ' + (err.error || err.message), false)
            });
        }
    }

    close(): void {
        this.dialogRef.close();
    }
}
