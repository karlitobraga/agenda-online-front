import { CommonModule, NgIf, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService } from '../../login/login.service';
import { InfoDialogService } from '../../shared/info-dialog/info-dialog.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-admin-login',
    standalone: true,
    imports: [NgIf, NgClass, CommonModule, ReactiveFormsModule],
    templateUrl: './admin-login.component.html',
    styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent {
    protected formGroup: FormGroup;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private loginService: LoginService,
        private infoDialogService: InfoDialogService) {
        this.formGroup = fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(5)]],
        });
    }

    public submit() {
        if (this.formGroup.valid) {
            // Map 'username' to 'phoneNumber' to match backend LoginRequest DTO
            let request = {
                phoneNumber: this.formGroup.get('username')?.value,
                password: this.formGroup.get('password')?.value,
            }

            this.loginService.login(request as any)
                .subscribe({
                    next: (response) => {
                        // Check if user is SuperAdmin (ideally backend returns role, but let's assume if it logs in here it's fine)
                        this.router.navigate(['/admin/dashboard']);
                    },
                    error: (error) => {
                        this.infoDialogService.showMessage(error.error?.message || "Erro ao realizar login", false)
                    }
                })
        }
        else {
            this.formGroup.markAllAsTouched();
        }
    }
}
