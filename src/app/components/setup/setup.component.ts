import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ServicesComponent } from './services/services.component';
import { SetupThemeComponent } from './theme/setup-theme.component';
import { SignupService } from '../signup/signup.service';

@Component({
    selector: 'app-setup',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        ServicesComponent,
        SetupThemeComponent
    ],
    templateUrl: './setup.component.html',
    styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit {
    currentStep: 'services' | 'theme' = 'services';

    constructor(
        private router: Router,
        private signupService: SignupService
    ) { }

    ngOnInit(): void { }

    onServicesCompleted(): void {
        this.currentStep = 'theme';
    }

    onThemeBack(): void {
        this.currentStep = 'services';
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

