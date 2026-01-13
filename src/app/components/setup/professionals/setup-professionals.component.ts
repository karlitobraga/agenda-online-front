import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ProfessionalService, Professional } from '../../../services/professional.service';
import { ProfessionalDetailComponent } from '../../settings/professional-settings/professional-detail/professional-detail.component';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';

@Component({
    selector: 'app-setup-professionals',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        NgxMaskDirective,
        NgxMaskPipe
    ],
    templateUrl: './setup-professionals.component.html',
    styleUrls: ['./setup-professionals.component.scss']
})
export class SetupProfessionalsComponent implements OnInit {
    @Input() showBackButton: boolean = true;
    @Output() completed = new EventEmitter<void>();
    @Output() back = new EventEmitter<void>();

    public professionals: Professional[] = [];

    constructor(
        private professionalService: ProfessionalService,
        private dialog: MatDialog
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
        if (this.professionals.length > 1) {
            this.professionalService.delete(professional.id).subscribe({
                next: () => this.loadProfessionals(),
                error: (err) => console.error('Erro ao excluir profissional', err)
            });
        }
    }

    get canContinue(): boolean {
        return this.professionals.length > 0;
    }

    onContinue(): void {
        if (this.canContinue) {
            this.completed.emit();
        }
    }

    onBack(): void {
        this.back.emit();
    }
}
