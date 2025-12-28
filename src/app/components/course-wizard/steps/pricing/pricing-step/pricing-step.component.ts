import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseDraftService } from '../../../core/services/course-draft.service';
import { RecCourseService } from '../../../core/services/rec-course.service';

@Component({
    selector: 'app-pricing-step',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './pricing-step.component.html',
    styleUrl: './pricing-step.component.scss',
})
export class PricingStepComponent implements OnInit {
    private fb = inject(FormBuilder);
    private draft = inject(CourseDraftService);
    private courseService = inject(RecCourseService);

    form = this.fb.group({
        isFree: [false, Validators.required],
        price: [0, [Validators.required, Validators.min(0)]],
        discountedPrice: [0, [Validators.min(0)]],
    });

    snap: any;

    // Earnings variables
    targetEarnings: number = 0; // Trainer's target earnings (net)
    splitType: string = 'trainer-led';  // Default split type
    finalAmount: number = 0; // The final amount trainer should set to reach target earnings (including VAT)

    // Constants for VAT and Stripe fee
    VAT_RATE = 0.24;  // 24% VAT in Finland
    STRIPE_FEE_PERCENT = 0.029; // 2.9% Stripe fee
    STRIPE_FEE_FIXED = 0.30; // 0.30 EUR fixed Stripe fee
    ADDITIONAL_PLATFORM_FEE_PERCENT = 0.05; // 5% platform fee

    policyAccepted: boolean = false;

    ngOnInit() {
        this.snap = this.draft.getSnapshot();

        this.form.patchValue({
            isFree: this.snap.isFree ?? false,
            price: this.snap.price ?? 0,
            discountedPrice: this.snap.discountedPrice ?? 0,
        });
    }

    save() {
        if (!this.policyAccepted) {
            alert('Please accept the payment policy before continuing.');
            return;
        }

        const val = this.form.value;
        if (val.isFree) {
            this.draft.update({
                isFree: true,
                price: 0,
                discountedPrice: 0,
            });
        } else {
            const payload = {
                id: this.generateUUID(),
                name: this.snap.title + ' - ' + (this.snap.subtitle || 'Course Fee'),
                currency: '$',
                price: val.price,
                discountedPrice: val.discountedPrice !== 0 ? val.discountedPrice : null,
                priceType: val.discountedPrice !== 0 ? 'discounted' : 'default'
            }

            this.courseService.createStripeProduct(payload, this.snap.title || 'Course Fee').subscribe((data: any) => {
                this.draft.update({
                    installment: data,
                    isFree: false,
                    price: val.price,
                    discountedPrice: val.discountedPrice,
                });
            });
        }
    }

    generateUUID(): string {
        let d = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    // Calculate trainer earnings based on the final amount entered
    calcTrainerEarning(amount: number, splitType: string): number {
        const { trainerPercent } = this.getSplit(splitType);

        const amountWithVAT = amount; // Final price includes VAT already
        const stripeFee = amountWithVAT * this.STRIPE_FEE_PERCENT + this.STRIPE_FEE_FIXED;
        const platformFee = amountWithVAT * this.ADDITIONAL_PLATFORM_FEE_PERCENT;

        // Calculate the trainer's net earnings after fees
        const trainerEarnings = amountWithVAT * trainerPercent - stripeFee - platformFee;
        return Math.round(trainerEarnings * 100) / 100;
    }

    // Calculate platform earnings based on the final amount entered
    calcPlatformEarning(amount: number, splitType: string): number {
        const { platformPercent } = this.getSplit(splitType);

        const amountWithVAT = amount; // Final price includes VAT already
        const stripeFee = amountWithVAT * this.STRIPE_FEE_PERCENT + this.STRIPE_FEE_FIXED;
        const platformFee = amountWithVAT * this.ADDITIONAL_PLATFORM_FEE_PERCENT;

        // Calculate the platform's earnings after fees
        const platformEarnings = amountWithVAT * platformPercent - stripeFee - platformFee;
        return Math.round(platformEarnings * 100) / 100;
    }

    // Helper method to get split details (based on the type)
    getSplit(splitType: string) {
        switch (splitType) {
            case 'trainer-led':
                return { trainerPercent: 0.90, platformPercent: 0.10 };
            case 'promotion':
                return { trainerPercent: 0.30, platformPercent: 0.70 };
            case 'platform-led':
                return { trainerPercent: 0.40, platformPercent: 0.60 };
            default:
                return { trainerPercent: 0.50, platformPercent: 0.50 };
        }
    }

    // Triggered when the trainer sets a target earnings (net amount)
    // they want to receive after all deductions
    onTargetEarningsChanged(targetEarnings: number) {
        this.finalAmount = this.calcFinalAmount(targetEarnings);
    }

    // Calculate the final price trainer should set to achieve target earnings (net)
    calcFinalAmount(targetEarnings: number): number {
        // Calculate the amount without VAT first (to cover fees)
        const requiredAmountWithoutVAT = targetEarnings / (1 - this.STRIPE_FEE_PERCENT - this.ADDITIONAL_PLATFORM_FEE_PERCENT);

        // Now calculate the final price including VAT
        const finalAmountWithVAT = requiredAmountWithoutVAT * (1 + this.VAT_RATE);  // Add VAT

        return Math.round(finalAmountWithVAT * 100) / 100;
    }
}
