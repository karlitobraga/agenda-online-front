import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfessionalService } from '../../services/professional.service';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { BookingApiService, TenantPublic, ServicePublic, TimeSlot } from '../../services/booking-api.service';
import { NgxMaskDirective } from 'ngx-mask';

enum BookingStep {
    ClientInfo = 1,
    SelectProfessional = 2,
    SelectService = 3,
    SelectDateTime = 4,
    Confirmation = 5
}

@Component({
    selector: 'app-booking',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatInputModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatSelectModule,
        MatDialogModule,
        NgxMaskDirective
    ],
    templateUrl: './booking.component.html',
    styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
    BookingStep = BookingStep;
    currentStep: BookingStep = BookingStep.ClientInfo;
    slug: string = '';

    tenant: TenantPublic | null = null;
    services: ServicePublic[] = [];
    professionals: any[] = [];
    availableSlots: TimeSlot[] = [];

    selectedProfessional: any | null = null;
    selectedServices: ServicePublic[] = [];
    selectedDate: Date = new Date();
    selectedSlot: TimeSlot | null = null;

    clientForm: FormGroup;
    loading: boolean = false;
    loadingProfessionals: boolean = false;
    loadingSlots: boolean = false;
    bookingSuccess: boolean = false;
    error: string = '';

    minDate: Date = new Date();

    // Pet specific
    pets: { name: string, breed?: string, quantity: number, serviceIds: string[], services: ServicePublic[] }[] = [];
    currentPetName: string = '';
    currentPetBreed: string = '';
    currentPetQuantity: number = 1;

    constructor(
        private route: ActivatedRoute,
        private bookingApi: BookingApiService,
        private professionalService: ProfessionalService,
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) {
        this.clientForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            phone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
            note: ['']
        });

        // Set min date to today
        this.minDate.setHours(0, 0, 0, 0);
    }

    ngOnInit(): void {
        this.slug = this.route.snapshot.paramMap.get('slug') || '';
        if (this.slug) {
            this.loadTenantInfo();
        }
    }

    loadTenantInfo() {
        this.loading = true;
        this.bookingApi.getTenant(this.slug).subscribe({
            next: (tenant) => {
                this.tenant = tenant;
                this.applyTheme();
                this.loadProfessionals();
                this.loadServices();
            },
            error: (err) => {
                this.error = 'Estabelecimento não encontrado.';
                this.loading = false;
            }
        });
    }

    loadServices() {
        this.bookingApi.getServices(this.slug).subscribe({
            next: (services) => {
                this.services = services;
                this.loading = false;
            },
            error: () => {
                this.error = 'Erro ao carregar serviços.';
                this.loading = false;
            }
        });
    }

    loadProfessionals() {
        this.loadingProfessionals = true;
        // Need tenantId to load professionals. TenantPublic usually has Id.
        if (this.tenant) {
            this.professionalService.getPublicByTenantId(this.tenant.id).subscribe({
                next: (profs) => {
                    this.professionals = profs;
                    this.loadingProfessionals = false;
                },
                error: () => {
                    this.loadingProfessionals = false;
                }
            });
        }
    }

    // Step 1: Client Info
    submitClientInfo() {
        if (this.clientForm.valid) {
            // Check if name has animals (optional improvement)
            if (this.professionals.length > 0) {
                this.currentStep = BookingStep.SelectProfessional;
            } else {
                this.currentStep = BookingStep.SelectService;
            }
        }
    }

    addCurrentPet() {
        if (this.selectedServices.length > 0) {
            this.pets.push({
                name: this.currentPetName || (this.tenant?.businessType === 'Pet Shop' ? `Animal ${this.pets.length + 1}` : 'Agendamento'),
                breed: this.currentPetBreed,
                quantity: this.currentPetQuantity || 1,
                serviceIds: this.selectedServices.map(s => s.id),
                services: [...this.selectedServices]
            });

            // Reset for next pet
            this.currentPetName = '';
            this.currentPetBreed = '';
            this.selectedServices = [];

            this.snackBar.open('Adicionado! Você pode incluir mais ou continuar.', 'Fechar', {
                duration: 3000
            });
        }
    }

    removePet(index: number) {
        this.pets.splice(index, 1);
    }

    // Step 2: Professional Selection
    selectProfessional(prof: any) {
        this.selectedProfessional = prof;
        this.currentStep = BookingStep.SelectService;
    }

    skipProfessional() {
        this.selectedProfessional = null;
        this.currentStep = BookingStep.SelectService;
    }

    // Step 2: Service Selection
    toggleService(service: ServicePublic) {
        const index = this.selectedServices.findIndex(s => s.id === service.id);
        if (index > -1) {
            this.selectedServices.splice(index, 1);
        } else {
            this.selectedServices.push(service);
        }
    }

    isServiceSelected(service: ServicePublic): boolean {
        return this.selectedServices.some(s => s.id === service.id);
    }

    getAvailableServices(): ServicePublic[] {
        if (!this.selectedProfessional) return this.services;

        // Filter out excluded services for the selected professional
        const excludedIds = this.selectedProfessional.excludedOfferingIds || [];
        return this.services.filter(s =>
            !excludedIds.includes(s.id)
        );
    }

    confirmServices() {
        // If there are selected services not yet added to pets list, add them now
        if (this.selectedServices.length > 0) {
            this.addCurrentPet();
        }

        if (this.pets.length > 0) {
            this.currentStep = BookingStep.SelectDateTime;
            this.loadAvailableSlots();
        }
    }
    // Step 3: DateTime Selection
    onDateChange(event: any) {
        this.selectedDate = event.value;
        this.selectedSlot = null;
        this.loadAvailableSlots();
    }

    loadAvailableSlots() {
        if (this.selectedServices.length === 0) return;

        this.loadingSlots = true;
        const dateStr = this.formatDate(this.selectedDate);

        // Prepare service IDs, including duplicates for quantity
        const serviceIds: string[] = [];
        this.pets.forEach(pet => {
            for (let i = 0; i < pet.quantity; i++) {
                serviceIds.push(...pet.serviceIds);
            }
        });

        this.bookingApi.getAvailableSlots(this.slug, dateStr, serviceIds, this.selectedProfessional?.id).subscribe({
            next: (slots) => {
                this.availableSlots = slots;
                this.loadingSlots = false;
            },
            error: () => {
                this.availableSlots = [];
                this.loadingSlots = false;
            }
        });
    }

    selectSlot(slot: TimeSlot) {
        this.selectedSlot = slot;
    }

    confirmDateTime() {
        if (this.selectedSlot) {
            this.currentStep = BookingStep.Confirmation;
        }
    }

    // Step 4: Confirmation
    confirmBooking() {
        if (!this.selectedSlot || this.selectedServices.length === 0) return;

        this.loading = true;

        const booking = {
            clientName: this.clientForm.value.name,
            phoneNumber: this.clientForm.value.phone,
            dateTime: this.selectedSlot.dateTime,
            professionalId: this.selectedProfessional?.id,
            petItems: this.pets.map(p => ({
                name: p.name,
                breed: p.breed,
                quantity: p.quantity,
                serviceIds: p.serviceIds
            }))
        };

        this.bookingApi.createBooking(this.slug, booking).subscribe({
            next: () => {
                this.bookingSuccess = true;
                this.loading = false;
            },
            error: (err) => {
                this.snackBar.open(err.error?.message || 'Erro ao criar agendamento', 'Fechar', {
                    duration: 5000
                });
                this.loading = false;
            }
        });
    }

    // Navigation
    goBack() {
        if (this.currentStep > BookingStep.ClientInfo) {
            this.currentStep--;
        }
    }

    // Helpers
    formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    }

    getSelectedServicesNames(): string {
        return this.pets.flatMap(p => p.services.map(s => s.name)).join(', ');
    }

    getTotalPrice(): number {
        return this.pets.reduce((sum, p) => sum + (p.services.reduce((sSum, s) => sSum + s.price, 0) * p.quantity), 0);
    }

    private applyTheme() {
        if (!this.tenant) return;

        const color = this.tenant.themeColor || '#667eea';
        const root = document.documentElement;

        // Set CSS variables for dynamic styling
        root.style.setProperty('--primary-color', color);

        // Generate a slightly darker version for gradients/hover (using simple opacity or fixed adjustment if needed)
        // For now just using the same color or a hardcoded variant
        root.style.setProperty('--primary-dark', this.adjustColor(color, -20));
    }

    private adjustColor(hex: string, amt: number) {
        let usePound = false;
        if (hex[0] == "#") {
            hex = hex.slice(1);
            usePound = true;
        }

        const num = parseInt(hex, 16);
        let r = (num >> 16) + amt;
        if (r > 255) r = 255; else if (r < 0) r = 0;
        let b = ((num >> 8) & 0x00FF) + amt;
        if (b > 255) b = 255; else if (b < 0) b = 0;
        let g = (num & 0x0000FF) + amt;
        if (g > 255) g = 255; else if (g < 0) g = 0;

        return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
    }
}
