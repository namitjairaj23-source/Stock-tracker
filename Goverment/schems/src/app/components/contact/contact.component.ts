import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactUserComponent {
  
  // Contact details (replace with your own numbers/usernames)
  whatsappNumber: string = '917737770537';
  telegramUsername: string = 'vardhaan_sharma';

  /**
   * Send a message via WhatsApp
   * @param name - Sender's name
   * @param message - The message to send
   */
  sendWhatsAppMessage(name: string, message: string) {
    const text = `Hello, my name is ${name}. ${message}`;
    const url = `https://api.whatsapp.com/send?phone=${this.whatsappNumber}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank'); // Open in new tab
  }

  /**
   * Send a message via Telegram
   * @param message - The message to send
   */
  sendTelegramMessage(message: string) {
    const text = encodeURIComponent(message);
    const url = `https://t.me/${this.telegramUsername}?text=${text}`;
    window.open(url, '_blank'); // Open in new tab
  }
}
