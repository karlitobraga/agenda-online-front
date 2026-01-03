import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { BookingApiService, TenantPublic, ServicePublic, TimeSlot } from '../../services/booking-api.service';

enum BookingStep {
    ClientInfo = 1,
    SelectService = 2,
    SelectDateTime = 3,
    Confirmation = 4
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
        MatSnackBarModule
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
    availableSlots: TimeSlot[] = [];

    selectedServices: ServicePublic[] = [];
    selectedDate: Date = new Date();
    selectedSlot: TimeSlot | null = null;

    clientForm: FormGroup;
    loading: boolean = false;
    loadingSlots: boolean = false;
    bookingSuccess: boolean = false;
    error: string = '';

    minDate: Date = new Date();

    constructor(
        private route: ActivatedRoute,
        private bookingApi: BookingApiService,
        private fb: FormBuilder,
        private snackBar: MatSnackBar
    ) {
        this.clientForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            phone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]]
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

    // Step 1: Client Info
    submitClientInfo() {
        if (this.clientForm.valid) {
            this.currentStep = BookingStep.SelectService;
        }
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

    confirmServices() {
        if (this.selectedServices.length > 0) {
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
        // Calculate total duration for multi-service booking
        const totalDuration = this.getTotalDuration();

        const serviceIds = this.selectedServices.map(s => s.id);

        this.bookingApi.getAvailableSlots(this.slug, dateStr, serviceIds).subscribe({
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
            serviceIds: this.selectedServices.map(s => s.id),
            dateTime: this.selectedSlot.dateTime
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

    getTotalPrice(): number {
        return this.selectedServices.reduce((sum, s) => sum + s.price, 0);
    }

    getTotalDuration(): number {
        return this.selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
    }

    getSelectedServicesNames(): string {
        return this.selectedServices.map(s => s.name).join(', ');
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
