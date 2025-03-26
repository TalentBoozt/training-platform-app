import { Component } from '@angular/core';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-participants',
  imports: [
    NgForOf,
    NgIf,
    FormsModule,
    NgStyle
  ],
  templateUrl: './participants.component.html',
  styleUrl: './participants.component.scss',
  standalone: true
})
export class ParticipantsComponent {
  courses: any[] = [];
  installments: any[] = [];
  participants: any[] = [
    {
      id: 1,
      name: 'John Doe',
      email: '6oKtI@example.com',
      pStatus: 'unpaid', //Paid, Unpaid, Pending
      aStatus: 'Enrolled', //course status
    },
    {
      id: 2,
      name: 'John Doe',
      email: '6oKtI@example.com',
      pStatus: 'paid', //Paid, Unpaid, Pending
      aStatus: 'Enrolled', //course status
    },
    {
      id: 3,
      name: 'John Doe',
      email: '6oKtI@example.com',
      pStatus: 'unpaid', //Paid, Unpaid, Pending
      aStatus: 'Enrolled', //course status
    },
    {
      id: 4,
      name: 'John Doe',
      email: '6oKtI@example.com',
      pStatus: 'pending', //Paid, Unpaid, Pending
      aStatus: 'Dropped', //course status
    }
  ];
  paidStatus: any[] = [
    {
      name: 'Paid',
      value: 'paid'
    },
    {
      name: 'Unpaid',
      value: 'unpaid'
    },
    {
      name: 'Pending',
      value: 'pending'
    }
  ];
  accountStatus: any[] = [
    {
      name: 'Enrolled',
      value: 'Enrolled'
    },
    {
      name: 'Dropped',
      value: 'Dropped'
    },
    {
      name: 'Completed',
      value: 'Completed'
    }
  ];
}
