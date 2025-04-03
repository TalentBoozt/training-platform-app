import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-module-card',
  imports: [
    NgIf
  ],
  templateUrl: './module-card.component.html',
  styleUrl: './module-card.component.scss',
  standalone: true
})
export class ModuleCardComponent {
  @Input() courseId: any
  @Input() module: any
  @Input() installment: any
  @Input() moduleIndex: any
  @Output() openDetails: EventEmitter<any> = new EventEmitter<any>();
  @Output() bankPayment: EventEmitter<any> = new EventEmitter<any>();

  coursePrice(installmentId: any): string {
    let price: string = 'Free';
    if (installmentId && installmentId == this.installment.id) {
      price = this.installment.currency + ' ' + this.installment.price
    }
    return price;
  }

  makePayment(installmentId: any): string {
    let redirect: string = '#'
    if (installmentId && installmentId == this.installment.id) {
      if(this.installment.paymentLink){
        redirect = this.installment.paymentLink
      }
    }
    return redirect;
  }

  openCourseDetails(module: any, installment?: any) {
    const course = {
      module: module,
      installment: installment
    }
    this.openDetails.emit(course);
  }

  openBankPayment(installment: any) {
    this.bankPayment.emit(installment);
  }
}
