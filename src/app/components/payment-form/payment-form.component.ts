import { Component, OnInit } from '@angular/core';
import { PaymentSessionService } from '../../services/payment-session.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaptureContext } from '../../models/capture-context';

declare var Accept: any;

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [PaymentSessionService],
})
export class PaymentFormComponent implements OnInit {
  captureContext: CaptureContext | null = null;
  transientToken: string = '';

  constructor(private paymentSessionService: PaymentSessionService) {}

  ngOnInit(): void {
    this.createPaymentSession();
  }

  createPaymentSession(): void {
    this.paymentSessionService.createSession().subscribe({
      next: (captureContext) => {
        this.captureContext = captureContext;
        this.loadAcceptJs(captureContext.clientLibrary);
      },
      error: (error) => {
        console.error('Error creating payment session:', error);
      },
    });
  }

  loadAcceptJs(url: string): void {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => {
      console.log('Accept.js loaded successfully');
    };
    script.onerror = () => {
      console.error('Failed to load Accept.js');
    };
    document.head.appendChild(script);
  }

  submitPayment(): void {
    if (this.captureContext && typeof Accept !== 'undefined') {
      Accept(this.captureContext)
        .then((accept: any) => accept.unifiedPayments())
        .then((up: any) =>
          up.show({
            containers: {
              paymentSelection: '#buttonPaymentListContainer',
              paymentScreen: '#embeddedPaymentContainer',
            },
          })
        )
        .then((tt: any) => {
          this.transientToken = tt;
          console.log('Transient Token:', this.transientToken);
          this.paymentSessionService
            .processPayment(this.transientToken)
            .subscribe({
              next: (response) => {
                console.log('Payment processed successfully:', response);
              },
              error: (error) => {
                console.error('Error processing payment:', error);
              },
            });
        })
        .catch((error: any) => {
          alert('Something went wrong: ' + error.message);
        });
    } else {
      console.error('Accept is not defined');
    }
  }
}
