import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ProfessionalService, Professional } from '../../../../services/professional.service';
import { OfferingService } from '../../../offering/offering.service';
import { IOfferingResponse } from '../../../offering/offering.interface';
import { InfoDialogService } from '../../../shared/info-dialog/info-dialog.service';

@Component({
    selector: 'app-professional-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatDialogModule
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
        private dialogRef: MatDialogRef<ProfessionalDetailComponent>,
        private dialogService: InfoDialogService,
        @Inject(MAT_DIALOG_DATA) public data: Professional | null
    ) {
        this.professionalForm = this.fb.group({
            name: ['', Validators.required],
            username: ['', Validators.required],
            password: ['', Validators.required],
            showInAgenda: [true]
        });
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
                error: (err) => this.dialogService.showMessage('Erro ao salvar: ' + err.error, false)
            });
        } else {
            this.professionalService.create(tenantId, payload).subscribe({
                next: () => {
                    this.dialogService.showMessage('Profissional cadastrado!', true);
                    this.dialogRef.close(true);
                },
                error: (err) => this.dialogService.showMessage('Erro ao cadastrar: ' + err.error, false)
            });
        }
    }

    close(): void {
        this.dialogRef.close();
    }
}
