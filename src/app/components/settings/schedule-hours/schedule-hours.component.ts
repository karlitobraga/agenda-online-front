import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormArray, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { DayWeekService, IDayWeek, ILunchTime } from '../../offering/day-week.service';
import { InfoDialogService } from '../../shared/info-dialog/info-dialog.service';

@Component({
    selector: 'app-schedule-hours',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSlideToggleModule
    ],
    templateUrl: './schedule-hours.component.html',
    styleUrls: ['./schedule-hours.component.scss']
})
export class ScheduleHoursComponent implements OnInit {
    public daysWeekForm: FormGroup;
    public lunchForm: FormGroup;
    public saving: boolean = false;

    constructor(
        private fb: FormBuilder,
        private dayWeekService: DayWeekService,
        private router: Router,
        private dialogService: InfoDialogService
    ) {
        this.daysWeekForm = fb.group({
            daysWeek: fb.array([])
        });

        this.lunchForm = this.fb.group({
            id: [''],
            active: [true],
            start: ['', [Validators.required]],
            end: ['', [Validators.required]],
        });
    }

    ngOnInit(): void {
        this.setupFormSubscriptions();
        this.loadInitialData();
    }

    get daysWeek(): FormArray {
        return this.daysWeekForm.get('daysWeek') as FormArray;
    }

    setupFormSubscriptions(): void {
        this.lunchForm.get('active')?.valueChanges.subscribe(active => {
            const start = this.lunchForm.get('start');
            const end = this.lunchForm.get('end');

            if (active) {
                start?.setValidators([Validators.required]);
                end?.setValidators([Validators.required]);
            } else {
                start?.clearValidators();
                end?.clearValidators();
            }

            start?.updateValueAndValidity();
            end?.updateValueAndValidity();
        });
    }

    loadInitialData(): void {
        const tenantId = localStorage.getItem('tenantId') ?? '';

        this.dayWeekService.getLunch(tenantId).subscribe({
            next: result => {
                this.lunchForm.patchValue({
                    id: result.id,
                    active: result.active,
                    start: result.start,
                    end: result.end,
                });
            }
        });

        this.dayWeekService.get(tenantId).subscribe(result => this.initDayWeekForm(result));
    }

    initDayWeekForm(days: IDayWeek[]): void {
        const ordemDias = [
            'Segunda-feira', 'Terça-feira', 'Quarta-feira',
            'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'
        ];

        days.sort((a, b) => ordemDias.indexOf(a.day) - ordemDias.indexOf(b.day));

        days.forEach(day => {
            const group = this.fb.group({
                id: [day.id],
                tenantId: [day.tenantId],
                day: [day.day],
                start: [day.start],
                end: [day.end],
                dayOff: [day.dayOff]
            });

            group.get('dayOff')?.valueChanges.subscribe(off => {
                const start = group.get('start');
                const end = group.get('end');
                if (off) {
                    start?.clearValidators();
                    end?.clearValidators();
                } else {
                    start?.setValidators([Validators.required]);
                    end?.setValidators([Validators.required]);
                }
                start?.updateValueAndValidity();
                end?.updateValueAndValidity();
            });

            this.daysWeek.push(group);
        });
    }

    save(): void {
        if (this.daysWeekForm.invalid || this.lunchForm.invalid) {
            this.daysWeekForm.markAllAsTouched();
            this.lunchForm.markAllAsTouched();
            return;
        }

        this.saving = true;
        const payload = this.daysWeek.value as IDayWeek[];

        this.dayWeekService.update(payload).subscribe({
            next: () => {
                const lunch: ILunchTime = {
                    id: this.lunchForm.get('id')?.value,
                    active: this.lunchForm.get('active')?.value,
                    start: this.lunchForm.get('start')?.value,
                    end: this.lunchForm.get('end')?.value
                };

                this.dayWeekService.updateLunch(lunch).subscribe({
                    next: () => {
                        this.saving = false;
                        this.dialogService.showMessage('Horários salvos com sucesso!', true);
                    },
                    error: () => {
                        this.saving = false;
                        this.dialogService.showMessage('Erro ao salvar horário de almoço', false);
                    }
                });
            },
            error: () => {
                this.saving = false;
                this.dialogService.showMessage('Erro ao salvar horários', false);
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/inicio']);
    }
}
