import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-moments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gallery">
      <h2>My Moments</h2>
      <div class="photos">
        <img *ngFor="let photo of photos" [src]="photo" alt="Moment photo" />
      </div>
    </div>
  `,
  styles: [`
    .gallery {
      text-align: center;
      padding: 20px;
    }
    .photos {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
    }
    img {
      width: 200px;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      transition: transform 0.3s ease;
    }
    img:hover {
      transform: scale(1.05);
    }
  `]
})
export class MomentsComponent {
  photos = [
    'assets/moments/photo1.jpg',
    'assets/moments/photo2.jpg',
    'assets/moments/photo3.jpg'
  ];
}
