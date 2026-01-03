import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-account-settings',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatCardModule,
        MatSnackBarModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './account-settings.component.html',
    styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {
    nameForm: FormGroup;
    passwordForm: FormGroup;
    themeForm: FormGroup;

    tenantId: string = '';
    tenantName: string = '';
    magicLink: string = '';

    savingName = false;
    savingPassword = false;
    savingTheme = false;
    generatingLink = false;

    constructor(
        private fb: FormBuilder,
        private http: HttpClient,
        private snackBar: MatSnackBar,
        private router: Router
    ) {
        this.nameForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]]
        });

        this.passwordForm = this.fb.group({
            oldPassword: ['', [Validators.required]],
            newPassword: ['', [Validators.required, Validators.minLength(4)]],
            confirmPassword: ['', [Validators.required]]
        });

        this.themeForm = this.fb.group({
            themeColor: ['#667eea'],
            logoUrl: ['']
        });
    }

    ngOnInit(): void {
        this.tenantId = localStorage.getItem('tenantId') || '';
        if (!this.tenantId) {
            this.router.navigate(['/login']);
            return;
        }
        this.loadTenantInfo();
    }

    loadTenantInfo() {
        this.http.get<any>(`${environment.apiUrl}/Auth/Tenant/${this.tenantId}`).subscribe({
            next: (tenant) => {
                this.tenantName = tenant.name;
                this.nameForm.patchValue({ name: tenant.name });
                this.themeForm.patchValue({
                    themeColor: tenant.themeColor || '#667eea',
                    logoUrl: tenant.logoUrl || ''
                });
            }
        });
    }

    saveName() {
        if (this.nameForm.invalid) return;

        this.savingName = true;
        this.http.put(`${environment.apiUrl}/Auth/Tenant/${this.tenantId}/name`, {
            name: this.nameForm.value.name
        }).subscribe({
            next: () => {
                this.tenantName = this.nameForm.value.name;
                this.snackBar.open('Nome atualizado com sucesso!', 'Fechar', { duration: 3000 });
                this.savingName = false;
            },
            error: (err) => {
                this.snackBar.open(err.error?.message || 'Erro ao atualizar nome', 'Fechar', { duration: 3000 });
                this.savingName = false;
            }
        });
    }

    savePassword() {
        if (this.passwordForm.invalid) return;

        if (this.passwordForm.value.newPassword !== this.passwordForm.value.confirmPassword) {
            this.snackBar.open('As senhas não coincidem', 'Fechar', { duration: 3000 });
            return;
        }

        this.savingPassword = true;
        this.http.put(`${environment.apiUrl}/Auth/Tenant/${this.tenantId}/password`, {
            oldPassword: this.passwordForm.value.oldPassword,
            newPassword: this.passwordForm.value.newPassword
        }).subscribe({
            next: () => {
                this.snackBar.open('Senha alterada com sucesso!', 'Fechar', { duration: 3000 });
                this.passwordForm.reset();
                this.savingPassword = false;
            },
            error: (err) => {
                this.snackBar.open(err.error?.message || 'Erro ao alterar senha', 'Fechar', { duration: 3000 });
                this.savingPassword = false;
            }
        });
    }

    generateMagicLink() {
        this.generatingLink = true;
        this.http.post<any>(`${environment.apiUrl}/Auth/MagicLink/${this.tenantId}`, {}).subscribe({
            next: (response) => {
                this.magicLink = `${window.location.origin}${response.url}`;
                this.generatingLink = false;
            },
            error: (err) => {
                this.snackBar.open(err.error?.message || 'Erro ao gerar link', 'Fechar', { duration: 3000 });
                this.generatingLink = false;
            }
        });
    }

    saveTheme() {
        this.savingTheme = true;
        this.http.put(`${environment.apiUrl}/Auth/Tenant/${this.tenantId}/theme`, {
            themeColor: this.themeForm.value.themeColor,
            logoUrl: this.themeForm.value.logoUrl
        }).subscribe({
            next: () => {
                this.snackBar.open('Tema atualizado com sucesso!', 'Fechar', { duration: 3000 });
                this.savingTheme = false;
            },
            error: (err) => {
                this.snackBar.open(err.error?.message || 'Erro ao atualizar tema', 'Fechar', { duration: 3000 });
                this.savingTheme = false;
            }
        });
    }

    copyMagicLink() {
        navigator.clipboard.writeText(this.magicLink).then(() => {
            this.snackBar.open('Link copiado para a área de transferência!', 'Fechar', { duration: 3000 });
        });
    }

    goBack() {
        this.router.navigate(['/inicio']);
    }
}
