import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { OfferingService } from '../../offering/offering.service';
import { IOfferingResponse } from '../../offering/offering.interface';
import { DetailComponent } from '../../offering/detail/detail.component';

@Component({
    selector: 'app-services',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule
    ],
    templateUrl: './services.component.html',
    styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {
    @Input() showBackButton: boolean = true;
    @Output() completed = new EventEmitter<void>();
    @Output() back = new EventEmitter<void>();

    public offerings: IOfferingResponse[] = [];

    constructor(
        private offeringService: OfferingService,
        private dialog: MatDialog
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
                next: () => this.loadServices(),
                error: (err) => console.error('Erro ao excluir serviço', err)
            });
        }
    }

    get canContinue(): boolean {
        return this.offerings.length > 0;
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
