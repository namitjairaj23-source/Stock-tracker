import { Component, ElementRef, ViewChild, AfterViewInit, Renderer2, HostListener } from '@angular/core';
import { CommonModule  } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class LandingComponent implements AfterViewInit {
  sidebarOpen = false;
  flipped: boolean[] = [false, false, false];
  currentYear = new Date().getFullYear();

  modalOpen = false;
  selectedImage = '';

  images: string[] = [
    'assets/gallery/pic1.jpg',
    'assets/gallery/pic2.jpg',
    'assets/gallery/pic3.jpg',
    'assets/gallery/pic4.jpg',
    'assets/gallery/pic1.jpg',
    'assets/gallery/pic2.jpg',
    'assets/gallery/pic3.jpg',
    'assets/gallery/pic4.jpg'
  ];

  // Gallery refs
  @ViewChild('gallery', { static: true }) galleryRef!: ElementRef<HTMLElement>;
  @ViewChild('thumb', { static: true }) thumbRef!: ElementRef<HTMLElement>;
  @ViewChild('scrollbarTrack', { static: true }) scrollbarTrackRef!: ElementRef<HTMLElement>;

  // dragging state
  private isDragging = false;
  private dragStartX = 0;
  private scrollStartX = 0;

  // thumb drag state
  private isThumbDragging = false;
  private thumbStartX = 0;
  private thumbLeftStart = 0;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    // set up initial thumb size + position
    this.updateThumb();
    // sync thumb while scrolling
    this.galleryRef.nativeElement.addEventListener('scroll', () => this.updateThumb());
    // update on resize
    window.addEventListener('resize', () => this.updateThumb());
  }

  /* ---------- Sidebar / cards / modal ---------- */
  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar(): void { this.sidebarOpen = false; }
  toggleFlip(index: number): void { this.flipped[index] = !this.flipped[index]; }
  openImage(img: string) { this.selectedImage = img; this.modalOpen = true; }
  closeImage() { this.modalOpen = false; }

  /* ---------- Arrow buttons: scroll by viewport width / 2 ---------- */
  scrollLeft() {
    const el = this.galleryRef.nativeElement;
    const amount = Math.round(el.clientWidth * 0.5);
    el.scrollBy({ left: -amount, behavior: 'smooth' });
  }

  scrollRight() {
    const el = this.galleryRef.nativeElement;
    const amount = Math.round(el.clientWidth * 0.5);
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }

  /* ---------- Mouse drag on gallery ---------- */
  onDragStart(event: MouseEvent) {
    // only left button
    if (event.button && event.button !== 0) return;
    this.isDragging = true;
    this.galleryRef.nativeElement.classList.add('dragging');
    this.dragStartX = event.clientX;
    this.scrollStartX = this.galleryRef.nativeElement.scrollLeft;
    // attach move / up listeners on document to continue outside element
    const onMove = (e: MouseEvent) => this.onDragging(e);
    const onUp = () => { 
      this.isDragging = false;
      this.galleryRef.nativeElement.classList.remove('dragging');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  private onDragging(e: MouseEvent) {
    if (!this.isDragging) return;
    e.preventDefault();
    const dx = this.dragStartX - e.clientX;
    this.galleryRef.nativeElement.scrollLeft = this.scrollStartX + dx;
  }

  /* ---------- Touch drag on gallery ---------- */
  onTouchStart(event: TouchEvent) {
    if (!event.touches || event.touches.length === 0) return;
    this.isDragging = true;
    this.galleryRef.nativeElement.classList.add('dragging');
    this.dragStartX = event.touches[0].clientX;
    this.scrollStartX = this.galleryRef.nativeElement.scrollLeft;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging || !event.touches || event.touches.length === 0) return;
    const dx = this.dragStartX - event.touches[0].clientX;
    this.galleryRef.nativeElement.scrollLeft = this.scrollStartX + dx;
  }

  onTouchEnd() {
    this.isDragging = false;
    this.galleryRef.nativeElement.classList.remove('dragging');
  }

  /* ---------- Custom scrollbar: compute thumb size & position ---------- */
  updateThumb() {
    const gallery = this.galleryRef.nativeElement;
    const track = this.scrollbarTrackRef.nativeElement;
    const thumb = this.thumbRef.nativeElement;

    // total scrollable width
    const scrollWidth = gallery.scrollWidth;
    const clientWidth = gallery.clientWidth;
    const maxScroll = Math.max(scrollWidth - clientWidth, 0);

    if (scrollWidth <= 0) return;

    // thumb width proportional to viewport width
    const trackWidth = track.clientWidth;
    const thumbWidth = Math.max(Math.round((clientWidth / scrollWidth) * trackWidth), 36);
    thumb.style.width = thumbWidth + 'px';

    // compute thumb left from scrollLeft
    const scrollLeft = gallery.scrollLeft;
    const usableTrack = trackWidth - thumbWidth;
    const left = usableTrack * (scrollLeft / (maxScroll || 1));
    thumb.style.left = Math.round(left) + 'px';
  }

  onScroll() {
    this.updateThumb();
  }

  /* ---------- Clicking on track jumps (center the thumb where clicked) ---------- */
  onScrollbarTrackClick(event: MouseEvent) {
    const track = this.scrollbarTrackRef.nativeElement;
    const gallery = this.galleryRef.nativeElement;
    const thumb = this.thumbRef.nativeElement;
    const rect = track.getBoundingClientRect();
    const clickX = event.clientX - rect.left;

    const thumbWidth = thumb.clientWidth;
    const targetLeft = Math.min(Math.max(clickX - thumbWidth / 2, 0), track.clientWidth - thumbWidth);

    // compute corresponding scrollLeft
    const maxScroll = gallery.scrollWidth - gallery.clientWidth;
    const usableTrack = track.clientWidth - thumbWidth;
    const scrollTarget = Math.round((targetLeft / (usableTrack || 1)) * (maxScroll || 0));

    gallery.scrollTo({ left: scrollTarget, behavior: 'smooth' });
  }

  /* ---------- Thumb dragging (pointer events) ---------- */
  onThumbPointerDown(event: PointerEvent) {
    event.preventDefault();
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    this.isThumbDragging = true;
    this.thumbStartX = event.clientX;
    this.thumbLeftStart = parseInt(this.thumbRef.nativeElement.style.left || '0', 10) || 0;

    const onMove = (e: PointerEvent) => this.onThumbPointerMove(e);
    const onUp = (e: PointerEvent) => {
      this.isThumbDragging = false;
      try { (event.target as HTMLElement).releasePointerCapture(event.pointerId); } catch {}
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  private onThumbPointerMove(e: PointerEvent) {
    if (!this.isThumbDragging) return;
    const track = this.scrollbarTrackRef.nativeElement;
    const gallery = this.galleryRef.nativeElement;
    const thumb = this.thumbRef.nativeElement;

    const dx = e.clientX - this.thumbStartX;
    const newLeft = Math.min(Math.max(this.thumbLeftStart + dx, 0), track.clientWidth - thumb.clientWidth);

    // move thumb visually
    thumb.style.left = newLeft + 'px';

    // move gallery scrollLeft accordingly
    const maxScroll = gallery.scrollWidth - gallery.clientWidth;
    const usableTrack = track.clientWidth - thumb.clientWidth;
    const ratio = (usableTrack > 0) ? (newLeft / usableTrack) : 0;
    const newScroll = Math.round(ratio * maxScroll);
    gallery.scrollLeft = newScroll;
  }

  /* ---------- keyboard support for thumb (left/right) ---------- */
  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    const active = document.activeElement;
    if (active === this.thumbRef?.nativeElement) {
      const gallery = this.galleryRef.nativeElement;
      if (event.key === 'ArrowRight') {
        gallery.scrollBy({ left: Math.round(gallery.clientWidth * 0.05), behavior: 'smooth' });
        event.preventDefault();
      } else if (event.key === 'ArrowLeft') {
        gallery.scrollBy({ left: -Math.round(gallery.clientWidth * 0.05), behavior: 'smooth' });
        event.preventDefault();
      } else if (event.key === 'Home') {
        gallery.scrollTo({ left: 0, behavior: 'smooth' });
        event.preventDefault();
      } else if (event.key === 'End') {
        gallery.scrollTo({ left: gallery.scrollWidth, behavior: 'smooth' });
        event.preventDefault();
      }
    }
  }
}
