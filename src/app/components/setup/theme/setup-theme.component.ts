import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-setup-theme',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
        MatSnackBarModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './setup-theme.component.html',
    styleUrls: ['./setup-theme.component.scss']
})
export class SetupThemeComponent {
    @Output() completed = new EventEmitter<void>();
    @Output() back = new EventEmitter<void>();

    themeForm: FormGroup;
    saving = false;
    tenantId: string;

    constructor(
        private fb: FormBuilder,
        private http: HttpClient,
        private snackBar: MatSnackBar
    ) {
        this.tenantId = localStorage.getItem('tenantId') || '';
        this.themeForm = this.fb.group({
            themeColor: ['#667eea'],
            logoBase64: [null]
        });
    }

    handleFileInput(event: any) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                this.themeForm.patchValue({
                    logoBase64: reader.result as string
                });
            };
            reader.readAsDataURL(file);
        }
    }

    save() {
        this.saving = true;
        this.http.put(`${environment.apiUrl}/Auth/Tenant/${this.tenantId}/theme`, {
            themeColor: this.themeForm.value.themeColor,
            logoBase64: this.themeForm.value.logoBase64
        }).subscribe({
            next: () => {
                this.completed.emit();
                this.saving = false;
            },
            error: (err) => {
                this.snackBar.open(err.error?.message || 'Erro ao salvar personalização', 'Fechar', { duration: 3000 });
                this.saving = false;
            }
        });
    }

    goBack() {
        this.back.emit();
    }
}
