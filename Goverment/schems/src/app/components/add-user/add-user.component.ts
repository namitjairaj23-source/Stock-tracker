// add.user.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  fb = inject(FormBuilder);
  userService = inject(UserService);
  router = inject(Router);

  userForm!: FormGroup;

  states: string[] = ['Maharashtra', 'Gujarat', 'Rajasthan'];
  districtsMap: { [key: string]: string[] } = {
    Maharashtra: ['Pune', 'Mumbai', 'Nagpur'],
    Gujarat: ['Ahmedabad', 'Surat', 'Vadodara'],
    Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur']
  };
  districts: string[] = [];
  selectedFiles: File[] = [];
  authorizedPersons: string[] = ['Admin', 'Clerk', 'Officer'];
  uploadedPhotos: string[] = [];

  ngOnInit(): void {
    this.userForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      state: ['', Validators.required],
      district: ['', Validators.required],
      shareName: ['', Validators.required],
      date: ['', Validators.required],
      qty: [null, [Validators.required, Validators.min(1)]],
      rate: [null, [Validators.required, Validators.min(1)]],
      amount: [{ value: '', disabled: true }],
      authorizedPerson: ['', Validators.required]
    });
  }

  onQtyOrRateChange(): void {
    const qty = this.userForm.get('qty')?.value || 0;
    const rate = this.userForm.get('rate')?.value || 0;
    const amount = qty * rate;
    this.userForm.get('amount')?.setValue(amount);
  }

  onStateChange(state: string): void {
    this.districts = this.districtsMap[state] || [];
    this.userForm.patchValue({ district: '' });
  }

  handleStateChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.onStateChange(target.value);
  }

  onPhotoUpload(event: any) {
    const files: FileList = event.target.files;
    if (files.length + this.uploadedPhotos.length > 2) {
      alert('Maximum 2 photos allowed');
      return;
    }
    for (let file of Array.from(files)) {
      this.selectedFiles.push(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.uploadedPhotos.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  updatePhoto(index: number, event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFiles[index] = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.uploadedPhotos[index] = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removePhoto(index: number) {
    this.uploadedPhotos.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  downloadPhoto(photoUrl: string) {
    const a = document.createElement('a');
    a.href = photoUrl;
    a.download = 'photo.jpg';
    a.click();
  }

  goBack() {
    this.router.navigate(['/home']);
  }

async onSubmit() {
  if (!this.userForm.valid) {
    this.userForm.markAllAsTouched();
    return;
  }

  const formValue = this.userForm.getRawValue();
  formValue.ShareAmount = formValue.ShareQty * formValue.ShareRate;

  this.userService.addUser(formValue).subscribe({
    next: () => {
      alert('User added successfully!');
      this.userForm.reset();
      this.selectedFiles = [];
      this.uploadedPhotos = [];
      this.router.navigate(['/home']);
    },
    error: (err) => {
      console.error('Failed to add user', err);
      alert('Failed to add user. Check console for details.');
    }
  });
}

}
