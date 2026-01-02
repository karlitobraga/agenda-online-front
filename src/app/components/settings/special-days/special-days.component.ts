import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router } from '@angular/router';
import { DayWeekService, ISpecialDay } from '../../offering/day-week.service';
import { InfoDialogService } from '../../shared/info-dialog/info-dialog.service';

@Component({
    selector: 'app-special-days',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSlideToggleModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    templateUrl: './special-days.component.html',
    styleUrls: ['./special-days.component.scss']
})
export class SpecialDaysComponent implements OnInit {
    public specialDayForm: FormGroup;
    public specialDays: ISpecialDay[] = [];
    public minDate: Date = new Date();

    constructor(
        private fb: FormBuilder,
        private dayWeekService: DayWeekService,
        private router: Router,
        private dialogService: InfoDialogService
    ) {
        this.specialDayForm = this.fb.group({
            date: [null, [Validators.required]],
            isDayOff: [true],
            start: [''],
            end: ['']
        }, { validators: this.timeRangeValidator });
    }

    // Custom validator: start must be before end
    timeRangeValidator(control: AbstractControl): ValidationErrors | null {
        const isDayOff = control.get('isDayOff')?.value;
        const start = control.get('start')?.value;
        const end = control.get('end')?.value;

        if (!isDayOff && start && end && start >= end) {
            return { timeRangeInvalid: true };
        }
        return null;
    }

    ngOnInit(): void {
        this.setupFormSubscriptions();
        this.loadSpecialDays();
    }

    setupFormSubscriptions(): void {
        this.specialDayForm.get('isDayOff')?.valueChanges.subscribe(isDayOff => {
            const start = this.specialDayForm.get('start');
            const end = this.specialDayForm.get('end');
            if (isDayOff) {
                start?.clearValidators();
                end?.clearValidators();
                start?.setValue('');
                end?.setValue('');
            } else {
                start?.setValidators([Validators.required]);
                end?.setValidators([Validators.required]);
            }
            start?.updateValueAndValidity();
            end?.updateValueAndValidity();
        });
    }

    loadSpecialDays(): void {
        const tenantId = localStorage.getItem('tenantId') ?? '';
        this.dayWeekService.getSpecialDays(tenantId).subscribe({
            next: (data) => this.specialDays = data,
            error: (err) => console.error('Erro ao carregar dias especiais', err)
        });
    }

    addSpecialDay(): void {
        if (this.specialDayForm.invalid) {
            this.specialDayForm.markAllAsTouched();
            return;
        }

        const tenantId = localStorage.getItem('tenantId') ?? '';
        const formValue = this.specialDayForm.value;

        // Convert Date object to ISO string for backend
        const dateValue = formValue.date instanceof Date 
            ? formValue.date.toISOString() 
            : formValue.date;

        const newSpecialDay: ISpecialDay = {
            tenantId: tenantId,
            date: dateValue,
            isDayOff: formValue.isDayOff,
            start: formValue.start || null,
            end: formValue.end || null
        };

        this.dayWeekService.addSpecialDay(newSpecialDay).subscribe({
            next: () => {
                this.loadSpecialDays();
                this.specialDayForm.reset({ isDayOff: true });
                this.dialogService.showMessage('Dia especial adicionado!', true);
            },
            error: (err) => {
                console.error('Erro ao adicionar dia especial', err);
                this.dialogService.showMessage('Erro ao adicionar dia especial', false);
            }
        });
    }

    deleteSpecialDay(id: string | undefined): void {
        if (!id) return;
        this.dayWeekService.deleteSpecialDay(id).subscribe({
            next: () => {
                this.loadSpecialDays();
                this.dialogService.showMessage('Dia especial removido!', true);
            },
            error: (err) => {
                console.error('Erro ao remover dia especial', err);
                this.dialogService.showMessage('Erro ao remover dia especial', false);
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/inicio']);
    }
}
