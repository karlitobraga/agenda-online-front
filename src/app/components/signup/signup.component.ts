import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InfoDialogService } from '../shared/info-dialog/info-dialog.service';
import { NgxMaskDirective } from 'ngx-mask';
import { SignupService } from './signup.service';
import { ITenantCreateRequest } from './signup.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [NgIf, CommonModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  protected formGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    private signupService: SignupService,
    private infoDialogService: InfoDialogService,
    private router: Router
  ) {
    this.formGroup = fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
      password: ['', [Validators.required, Validators.minLength(5)]],
      businessName: ['', [Validators.required]],
      businessType: ['Outros', [Validators.required]]
    });
  }

  public submit() {
    if (this.formGroup.valid) {
      let request: ITenantCreateRequest = {
        phoneNumber: this.formGroup.get('phoneNumber')?.value,
        password: this.formGroup.get('password')?.value,
        businessName: this.formGroup.get('businessName')?.value,
        businessType: this.formGroup.get('businessType')?.value
      }

      this.signupService.createTenant(request)
        .subscribe({
          next: (response) => {
            this.infoDialogService.showMessage("Usuário cadastrado com sucesso!", true);

            // Auto login logic
            if (response && response.token) {
              localStorage.setItem('token', response.token.toString());
              localStorage.setItem('tenantId', response.tenantId);

              setTimeout(() => {
                this.router.navigate(['/welcome']);
              }, 1500); // 1.5s delay to read toast
            }
          },
          error: (error) => {
            const errorMsg = error?.error?.message || error?.error || 'Ocorreu um erro desconhecido';
            this.infoDialogService.showMessage(errorMsg.toString(), false)
          }
        });
    } else {
      this.formGroup.markAllAsTouched();
    }
  }
}
