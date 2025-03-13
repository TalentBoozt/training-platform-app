import { Component } from '@angular/core';
import {ResumeStorageService} from '../../../services/support/resume-storage.service';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {AlertsService} from '../../../services/support/alerts.service';

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
export class PaymentDetailsComponent {
  installments: any[] = [];
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
    price: ''
  }

  cardInstallments: any[] = [];
  newCardInstallment = {
    id: '',
    paymentLink: '',
    name: '',
    currency: '$',
    price: ''
  }

  constructor(private resumeStorage: ResumeStorageService, private alertService: AlertsService) {}

  ngOnInit(): void {
    const savedData = this.resumeStorage.getData();
    if (savedData.installment) {
      this.bankInstallments = savedData.installment;
      this.cardInstallments = savedData.installment
    }
    if (!savedData.basicDetails.paymentMethod) {
      this.alertService.errorMessage('Payment acceptance method not found! Add it first in step 1', 'Error');
    } else {
      this.paymentMethod = savedData.basicDetails.paymentMethod;
    }
  }

  addInstallment(): void {
    if (this.paymentMethod == 'card'){
      if (this.newCardInstallment.paymentLink &&
        this.newCardInstallment.name &&
        this.newCardInstallment.price &&
        this.newCardInstallment.currency){
        this.newCardInstallment.id = this.generateRandomId();
        this.cardInstallments.push({ ...this.newCardInstallment });
        this.saveData();
        this.resetForm();
      } else {
        this.alertService.errorMessage('Fill all required fields!', 'Error')
      }
    } else if (this.paymentMethod == 'bank'){
      if (this.newBankInstallment.bank &&
        this.newBankInstallment.accountNb &&
        this.newBankInstallment.branch &&
        this.newBankInstallment.holder &&
        this.newBankInstallment.name &&
        this.newBankInstallment.price &&
        this.newBankInstallment.currency){
        this.newBankInstallment.id = this.generateRandomId();
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
        paymentLink: '',
        name: '',
        currency: '',
        price: ''
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
        price: ''
      }
    } else {
      return;
    }
  }

  generateRandomId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
