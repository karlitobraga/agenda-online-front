import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ServicesComponent } from './services/services.component';
import { SetupProfessionalsComponent } from './professionals/setup-professionals.component';
import { SetupThemeComponent } from './theme/setup-theme.component';
import { SignupService } from '../signup/signup.service';
import { QrCodeComponent } from './qr-code/qr-code.component';

@Component({
    selector: 'app-setup',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        ServicesComponent,
        SetupProfessionalsComponent,
        SetupThemeComponent,
        QrCodeComponent
    ],
    templateUrl: './setup.component.html',
    styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit {
    currentStep: 'services' | 'professionals' | 'whatsapp' | 'theme' = 'services';

    constructor(
        private router: Router,
        private signupService: SignupService
    ) { }

    ngOnInit(): void { }

    isStepCompleted(step: string): boolean {
        const steps = ['services', 'professionals', 'whatsapp', 'theme'];
        const currentIndex = steps.indexOf(this.currentStep);
        const stepIndex = steps.indexOf(step);
        return stepIndex < currentIndex;
    }

    onServicesCompleted(): void {
        this.currentStep = 'professionals';
    }

    onProfessionalsCompleted(): void {
        this.currentStep = 'whatsapp';
    }

    onWhatsappCompleted(): void {
        this.currentStep = 'theme';
    }

    onProfessionalsBack(): void {
        this.currentStep = 'services';
    }

    onWhatsappBack(): void {
        this.currentStep = 'professionals';
    }

    onThemeBack(): void {
        this.currentStep = 'whatsapp';
    }

    onSetupCompleted(): void {
        // Mark configuration as completed and navigate to home
        const tenantId = localStorage.getItem('tenantId') ?? '';
        this.signupService.updateTenant(tenantId, true).subscribe({
            next: () => {
                this.router.navigate(['/inicio']);
            },
            error: (err) => {
                console.error('Erro ao atualizar tenant', err);
                // Navigate anyway to not block user
                this.router.navigate(['/inicio']);
            }
        });
    }
}

