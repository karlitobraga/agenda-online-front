import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService } from './login.service';
import { InfoDialogService } from '../shared/info-dialog/info-dialog.service';
import { NgxMaskDirective } from 'ngx-mask';
import { ITenantLoginRequest } from './login.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIf, CommonModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  protected formGroup: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private loginService: LoginService,
    private infoDialogService: InfoDialogService) {
    this.formGroup = fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
      password: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  public submit() {
    if (this.formGroup.valid) {
      let request: ITenantLoginRequest = {
        phoneNumber: this.formGroup.get('phoneNumber')?.value,
        password: this.formGroup.get('password')?.value,
      }

      this.loginService.login(request)
        .subscribe({
          next: (response) => {
            localStorage.setItem('token', response.token.toString());
            localStorage.setItem('tenantId', response.tenantId);
            if (response.professionalId) {
              localStorage.setItem('professionalId', response.professionalId);
            } else {
              localStorage.removeItem('professionalId');
            }
            this.router.navigate(['/inicio']);
          },
          error: (error) => {
            this.infoDialogService.showMessage(error.error, false)
          }
        })
    }
    else {
      this.formGroup.markAllAsTouched();
    }
  }
}
