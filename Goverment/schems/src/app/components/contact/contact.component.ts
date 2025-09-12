import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactUserComponent {
  contactForm!: FormGroup;
  submitted = false;

  // Contact details
  whatsappNumber: string = '917737770537';
  telegramUsername: string = 'vardhaan_sharma';

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      contact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  get f() {
    return this.contactForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.contactForm.invalid) return;

    const { name, message } = this.contactForm.value;

    // ✅ Send WhatsApp directly
    this.sendWhatsAppMessage(name, message);

    // ✅ Optionally send Telegram
    // this.sendTelegramMessage(message);

    alert('Message sent successfully!');
    this.contactForm.reset();
    this.submitted = false;
  }

  /**
   * Send a message via WhatsApp
   */
  sendWhatsAppMessage(name: string, message: string) {
    const text = `Hello, my name is ${name}. ${message}`;
    const url = `https://api.whatsapp.com/send?phone=${this.whatsappNumber}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank'); 
  }

  /**
   * Send a message via Telegram
   */
  sendTelegramMessage(message: string) {
    const text = encodeURIComponent(message);
    const url = `https://t.me/${this.telegramUsername}?text=${text}`;
    window.open(url, '_blank'); 
  }
}
