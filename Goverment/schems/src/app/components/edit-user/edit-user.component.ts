import { Component, inject, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../user.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from '../../user/user.module';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit, OnDestroy, OnChanges {
  fb = inject(FormBuilder);
  userService = inject(UserService);
  router = inject(Router);

  @Input() user: User | null = null;

  userForm!: FormGroup;
  states: string[] = ['Maharashtra', 'Gujarat', 'Rajasthan'];
  districtsMap: { [key: string]: string[] } = {
    Maharashtra: ['Pune', 'Mumbai', 'Nagpur'],
    Gujarat: ['Ahmedabad', 'Surat', 'Vadodara'],
    Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur']
  };
  districts: string[] = [];
  authorizedPersons: string[] = ['Admin', 'Clerk', 'Officer'];

  uploadedPhoto: string | null = null; // Single photo URL or base64 string

  actionSub!: Subscription;

  ngOnInit(): void {
    this.userForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      state: ['', Validators.required],
      district: ['', Validators.required],
      ShareName: ['', Validators.required],
      date: ['', Validators.required],
      ShareQty: [null, [Validators.required, Validators.min(1)]],
      ShareRate : [null, [Validators.required, Validators.min(1)]],
      ShareAmount: [{ value: '', disabled: true }],
      authorizedPerson: ['', Validators.required]
    });

    this.actionSub = this.userService.action$.subscribe(action => {
      // Optional: react to action changes if needed
    });

    this.patchSelectedUser();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user && this.userForm) {
      this.userForm.patchValue({
        fullName: this.user.fullName,
        email: this.user.email,
        state: this.user.state,
        district: this.user.district,
        ShareName: this.user.ShareName,
        date: this.user.date,
        qty: this.user.ShareQty,
        rate: this.user.ShareRate,
        amount: this.user.ShareAmount,
        authorizedPerson: this.user.authorizedPerson
      });
      this.uploadedPhoto = this.user.photoUrl || null;
      this.onStateChange(this.user.state || '');
      this.onQtyOrRateChange();
    }
  }

  private patchSelectedUser() {
    const selectedUser = this.userService.getSelectedUser();
    if (selectedUser) {
      this.userForm.patchValue({
        fullName: selectedUser.fullName,
        email: selectedUser.email,
        state: selectedUser.state,
        district: selectedUser.district,
        ShareName: selectedUser.ShareName,
        date: selectedUser.date,
        qty : selectedUser.ShareQty,
        rate: selectedUser.ShareRate,
        amount: selectedUser.ShareAmount,
        authorizedPerson: selectedUser.authorizedPerson
      });
      this.uploadedPhoto = selectedUser.photoUrl || null;
      this.onStateChange(selectedUser.state || '');
      this.onQtyOrRateChange();
    }
  }

  handleStateChange(event: any) {
    const state = event.target.value;
    this.onStateChange(state);
  }

  onStateChange(state: string) {
    this.districts = this.districtsMap[state] || [];
    // Clear district if it doesn't belong to selected state
    if (!this.districts.includes(this.userForm.get('district')?.value)) {
      this.userForm.get('district')?.setValue('');
    }
  }

  onQtyOrRateChange() {
    const qty = this.userForm.get('ShareQty')?.value || 0;
    const rate = this.userForm.get('ShareRate')?.value || 0;
    this.userForm.get('ShareAmount')?.setValue(qty * rate);
  }

  onPhotoUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed.');
      return;
    }

    this.readFileAsBase64(file).then(base64 => {
      this.uploadedPhoto = base64;
      this.selectedFile = file;
    });
  }

  updatePhoto(event: any) {
    this.onPhotoUpload(event);
  }

  removePhoto() {
    this.uploadedPhoto = null;
    this.selectedFile = null;
  }

  downloadPhoto(photoUrl: string) {
    const a = document.createElement('a');
    a.href = photoUrl;
    a.download = 'photo.jpg';
    a.click();
  }

  selectedFile: File | null = null;

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formValue = this.userForm.getRawValue();
    const formData = new FormData();

    for (const key in formValue) {
      if (formValue.hasOwnProperty(key) && key !== 'ShareAmount') {
        formData.append(key, formValue[key]);
      }
    }

    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }

    const selectedUser = this.userService.getSelectedUser();
    const currentAction = this.userService.getCurrentAction();

    if (currentAction === 'edit' && selectedUser?.id) {
      this.userService.updateUser(selectedUser.id, formData).subscribe({
        next: () => {
          alert('User updated successfully!');
          this.userForm.reset();
          this.uploadedPhoto = null;
          this.selectedFile = null;
          this.router.navigate(['/home']);
        },
        error: () => alert('Failed to update user.')
      });
    } else {
      this.userService.addUser(formData).subscribe({
        next: () => {
          alert('User added successfully!');
          this.userForm.reset();
          this.uploadedPhoto = null;
          this.selectedFile = null;
          this.router.navigate(['/home']);
        },
        error: () => alert('Failed to add user.')
      });
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  ngOnDestroy() {
    this.actionSub.unsubscribe();
  }
}
