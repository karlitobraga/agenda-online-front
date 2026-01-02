import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { OfferingService } from '../../offering/offering.service';
import { IOfferingResponse } from '../../offering/offering.interface';
import { DetailComponent } from '../../offering/detail/detail.component';
import { InfoDialogService } from '../../shared/info-dialog/info-dialog.service';

@Component({
    selector: 'app-services-settings',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './services-settings.component.html',
    styleUrls: ['./services-settings.component.scss']
})
export class ServicesSettingsComponent implements OnInit {
    public offerings: IOfferingResponse[] = [];

    constructor(
        private offeringService: OfferingService,
        private dialog: MatDialog,
        private router: Router,
        private dialogService: InfoDialogService
    ) { }

    ngOnInit(): void {
        this.loadServices();
    }

    loadServices(): void {
        const tenantId = localStorage.getItem('tenantId') ?? '';
        this.offeringService.GetAll(tenantId).subscribe({
            next: (response) => {
                this.offerings = response;
            },
            error: (err) => console.error('Erro ao carregar serviços', err)
        });
    }

    openDetail(offering: IOfferingResponse | null = null): void {
        const dialogRef = this.dialog.open(DetailComponent, {
            width: '90vw',
            maxWidth: '500px',
            data: offering
        });
        dialogRef.afterClosed().subscribe(() => this.loadServices());
    }

    deleteService(offering: IOfferingResponse): void {
        if (this.offerings.length > 1) {
            this.offeringService.deleteOffering(offering.id).subscribe({
                next: () => {
                    this.loadServices();
                    this.dialogService.showMessage('Serviço removido!', true);
                },
                error: () => this.dialogService.showMessage('Erro ao remover serviço', false)
            });
        } else {
            this.dialogService.showMessage('Você precisa ter pelo menos um serviço cadastrado.', false);
        }
    }

    goBack(): void {
        this.router.navigate(['/inicio']);
    }
}
