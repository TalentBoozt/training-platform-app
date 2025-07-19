import {Component, OnInit} from '@angular/core';
import {ResumeStorageService} from '../../../services/support/resume-storage.service';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {AlertsService} from '../../../services/support/alerts.service';
import {CoursesService} from '../../../services/courses.service';

@Component({
  selector: 'app-payment-details',
  imports: [
    FormsModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './payment-details.component.html',
  styleUrl: './payment-details.component.scss',
  standalone: true
})
export class PaymentDetailsComponent implements OnInit{
  paymentMethod: string = 'card';

  bankInstallments: any[] = [];
  newBankInstallment = {
    id: '',
    bank: '',
    accountNb: '',
    branch: '',
    holder: '',
    name: '',
    currency: '$',
    price: 0,
    discountedPrice: '',
    discount: 0
  }

  cardInstallments: any[] = [];
  newCardInstallment = {
    id: '',
    name: '',
    currency: '$',
    price: 0,
    discountedPrice: '',
    discount: 0,
    productId: '',
    priceId: ''
  }

  isFreeCheck: boolean = false;
  isOnetimePayment: boolean = false;

  courseName: string = '';

  constructor(private resumeStorage: ResumeStorageService, private alertService: AlertsService, private courseService: CoursesService) {}

  ngOnInit(): void {
    const savedData = this.resumeStorage.getData();
    if (savedData.installment) {
      this.bankInstallments = savedData.installment;
      this.cardInstallments = savedData.installment
    }
    if (savedData?.basicDetails?.name) {
      this.courseName = savedData.basicDetails.name;
    }

    if (savedData?.relevantDetails?.freeCheck) {
      this.isFreeCheck = true;
    } else {
      if (!savedData?.basicDetails?.paymentMethod || savedData?.basicDetails?.paymentMethod == 'free') {
        this.alertService.errorMessage('Payment acceptance method not found or cleared in 3rd step! Add it first in step 1', 'Error');
        return;
      } else {
        this.paymentMethod = savedData.basicDetails.paymentMethod;
      }
    }

    if (savedData?.basicDetails?.paymentType == 'onetime') {
      this.isOnetimePayment = true;
    } else {
      if (!savedData?.basicDetails?.paymentType) {
        this.alertService.errorMessage('Payment type not found! Add it first in step 1', 'Error');
        return;
      }
    }
  }

  addInstallment(): void {
    if (this.paymentMethod == 'card'){
      const { name, currency, price, discount } = this.newCardInstallment;
      const productPrice = price - (price * discount / 100);
      if (name && currency && price) {
        this.courseService.createStripeProduct(this.courseName, name, currency, productPrice.toFixed(2).toString()).subscribe(response => {
          const installment = {
            ...this.newCardInstallment,
            id: this.generateRandomId(),
            discountedPrice: productPrice.toFixed(2),
            paymentMethod: 'card',
            productId: response.productId,
            priceId: response.priceId
          };
          this.cardInstallments.push(installment);
          this.saveData();
          this.resetForm();
        }, err => {
          this.alertService.errorMessage('Failed to create Stripe product.', 'Error');
        });
      } else {
        this.alertService.errorMessage('Fill all required fields!', 'Error')
      }
    } else if (this.paymentMethod == 'bank'){
      const {bank, accountNb, branch, holder, name, currency, price} = this.newBankInstallment;
      if (bank && accountNb && branch && holder && name && price && currency){
        this.newBankInstallment.id = this.generateRandomId();
        this.newBankInstallment.discountedPrice = (price - (price * this.newBankInstallment.discount / 100)).toFixed(2);
        this.bankInstallments.push({ ...this.newBankInstallment });
        this.saveData();
        this.resetForm();
      } else {
        this.alertService.errorMessage('Fill all required fields!', 'Error')
      }
    } else {
      return;
    }
  }

  removeInstallment(index: number): void {
    if (this.paymentMethod == 'card'){
      this.cardInstallments.splice(index, 1);
      this.saveData();
    } else if (this.paymentMethod == 'bank'){
      this.bankInstallments.splice(index, 1);
      this.saveData();
    } else {
      return;
    }
  }

  saveData(): void {
    if (this.paymentMethod == 'card'){
      this.resumeStorage.saveData('installment', this.cardInstallments);
    } else if (this.paymentMethod == 'bank'){
      this.resumeStorage.saveData('installment', this.bankInstallments);
    } else {
      return;
    }
  }

  resetForm(): void {
    if (this.paymentMethod == 'card'){
      this.newCardInstallment = {
        id: '',
        name: '',
        currency: '',
        price: 0,
        discountedPrice: '',
        discount: 0,
        productId: '',
        priceId: ''
      }
    } else if (this.paymentMethod == 'bank'){
      this.newBankInstallment = {
        id: '',
        bank: '',
        accountNb: '',
        branch: '',
        holder: '',
        name: '',
        currency: '',
        price: 0,
        discountedPrice: '',
        discount: 0
      }
    } else {
      return;
    }
  }

  generateRandomId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  isValidUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }
}
