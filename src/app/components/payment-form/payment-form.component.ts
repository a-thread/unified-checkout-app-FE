import { Component, OnInit } from '@angular/core';
import { PaymentSessionService } from '../../services/payment-session.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var Accept: any;

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  providers: [
    PaymentSessionService
  ],
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.scss'
})
export class PaymentFormComponent  implements OnInit {
  captureContext: string = '';
  transientToken: string= '';

  constructor(
    private paymentSessionService: PaymentSessionService,
  ) {}

  ngOnInit(): void {
    this.createPaymentSession();
  }

  createPaymentSession(): void {
    this.paymentSessionService.createSession().subscribe({
      next: (response) => {
        this.captureContext = response.captureContext;
      },
      error: (error) => {
        console.error('Error creating payment session:', error);
      }
    });
  }

  submitPayment(): void {
    if (typeof Accept !== 'undefined') {
      Accept(this.captureContext)
        .then((accept: any) => accept.unifiedPayments())
        .then((up: any) => up.show({
          containers: {
            paymentSelection: "#buttonPaymentListContainer",
            paymentScreen: "#embeddedPaymentContainer"
          }
        }))
        .then((tt: any) => {
          this.transientToken = tt;
          // Here, you can send the transient token to your server for further processing
          console.log('Transient Token:', this.transientToken);
        })
        .catch((error: any) => {
          alert("Something went wrong: " + error.message);
        });
    } else {
      console.error('Accept is not defined');
    }
  }
}