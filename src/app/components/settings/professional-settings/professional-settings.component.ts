import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ProfessionalService, Professional } from '../../../services/professional.service';
import { InfoDialogService } from '../../../shared/info-dialog/info-dialog.service';
import { ProfessionalDetailComponent } from './professional-detail/professional-detail.component';

@Component({
    selector: 'app-professional-settings',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule
    ],
    templateUrl: './professional-settings.component.html',
    styleUrls: ['./professional-settings.component.scss']
})
export class ProfessionalSettingsComponent implements OnInit {
    public professionals: Professional[] = [];

    constructor(
        private professionalService: ProfessionalService,
        private dialog: MatDialog,
        private router: Router,
        private dialogService: InfoDialogService
    ) { }

    ngOnInit(): void {
        this.loadProfessionals();
    }

    loadProfessionals(): void {
        const tenantId = localStorage.getItem('tenantId') ?? '';
        this.professionalService.getByTenantId(tenantId).subscribe({
            next: (response) => {
                this.professionals = response;
            },
            error: (err) => console.error('Erro ao carregar profissionais', err)
        });
    }

    openDetail(professional: Professional | null = null): void {
        const dialogRef = this.dialog.open(ProfessionalDetailComponent, {
            width: '90vw',
            maxWidth: '600px',
            data: professional
        });
        dialogRef.afterClosed().subscribe(() => this.loadProfessionals());
    }

    deleteProfessional(professional: Professional): void {
        this.professionalService.delete(professional.id).subscribe({
            next: () => {
                this.loadProfessionals();
                this.dialogService.showMessage('Profissional removido!', true);
            },
            error: () => this.dialogService.showMessage('Erro ao remover profissional', false)
        });
    }

    goBack(): void {
        this.router.navigate(['/inicio']);
    }
}
