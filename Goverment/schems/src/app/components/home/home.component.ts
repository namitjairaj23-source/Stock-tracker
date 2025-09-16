import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../user.service';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx'; // For Excel export
import jsPDF from 'jspdf';    // For PDF export
import autoTable from 'jspdf-autotable'; // For PDF table export
import { NotificationTickerComponent } from '../../notification-ticker/notification-ticker.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, EditUserComponent, NotificationTickerComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  users: any[] = [];
  filtered: any[] = [];
  filteredUsers: any[] = []; // Filtered users (for export & display)
  notifications: string[] = [];
  filters = {
    name: '',
    state: '',
    district: ''
  };
  currentPage = 1;
  pageSize = 5;

  editMode = false;
  selectedUser: any = null;
  sortKey: string = '';

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // 🧠 Load users from API
  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.applyFilter();
      },
      error: (err: any) => console.error(err)
    });
  }

  // 🧠 Get full name
 getFullName(user: any): string {
  return user.fullName || '';
}


  // 🔍 Filter users
  applyFilter() {
    const { name, state, district } = this.filters;
    this.filtered = this.users.filter(user =>
      (!name || this.getFullName(user).toLowerCase().includes(name.toLowerCase())) &&
      (!state || user.state?.toLowerCase().includes(state.toLowerCase())) &&
      (!district || user.district?.toLowerCase().includes(district.toLowerCase()))
    );
    this.filteredUsers = [...this.filtered];
    this.applySorting();
    this.currentPage = 1;
  }

  // ⬆️ Sort filtered users
  applySorting() {
    switch (this.sortKey) {
      case 'name':
        this.filtered.sort((a, b) => this.getFullName(a).localeCompare(this.getFullName(b)));
        break;
        case 'email':
  this.filtered.sort((a,b) => (a.email || '').localeCompare(b.email || ''));
  break
      case 'state':
        this.filtered.sort((a, b) => (a.state || '').localeCompare(b.state || ''));
        break;
      case 'district':
        this.filtered.sort((a, b) => (a.district || '').localeCompare(b.district || ''));
        break;
      case 'date':
        this.filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'share':
        this.filtered.sort((a, b) => (a.shareName || '').localeCompare(b.shareName || ''));
        break;
      case 'qty':
        this.filtered.sort((a, b) => a.qty - b.qty);
        break;
      case 'rate':
        this.filtered.sort((a, b) => a.rate - b.rate);
        break;
      case 'amount':
        this.filtered.sort((a, b) => a.amount - b.amount);
        break;
        case 'authorizedPerson':
  this.filtered.sort((a,b) => (a.authorizedPerson || '').localeCompare(b.authorizedPerson || ''));
  break;
    }
  }

  // 🔢 Total number of pages
  get totalPages(): number {
    return Math.ceil(this.filtered.length / this.pageSize);
  }

  // ➡️ Next page
  goNext() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // ⬅️ Previous page
  goPrevious() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // 📤 Export to Excel
  exportExcel(): void {
    const dataToExport = this.filteredUsers.map((user: any, index: number) => ({
      '#': index + 1,
      Name: this.getFullName(user),
      Email: user.email,
      State: user.state,
      District: user.district,
      Date: user.date,
      'shareName': user.shareName,
      Qty: user.qty,
      Rate: user.rate,
      Amount: user.amount,
      AuthorizedPerson: user.authorizedPerson
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, 'Filtered_Users.xlsx');
  }

  // 📤 Export to PDF
  exportPDF(): void {
    const doc = new jsPDF();
    const rows = this.filteredUsers.map((user: any, index: number) => [
      index + 1,
      this.getFullName(user),
      user.email,
      user.state,
      user.district,
      user.date,
      user.shareName,
      user.qty,
      user.rate,
      user.amount,
      user.authorizedPerson
    ]);

    const columns = [
      '#', 'Name', 'Email', 'State', 'District', 'Date',
      'Share Name', 'Qty', 'Rate', 'Amount', 'Authorized Person'
    ];

    autoTable(doc, {
      head: [columns],
      body: rows
    });

    doc.save('Filtered_Users.pdf');
  }

  // 📸 Upload Photo
  onPhotoUpload(event: Event | any, user: any) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const reader = new FileReader();
      reader.onload = () => {
        user.photoUrl = reader.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  // ❌ Remove photo
  removePhoto(user: any) {
    user.photoUrl = '';
  }

  // ➕ Add user
  // addUser(user: any) {
  //   this.userService.addUser(user).subscribe({
  //     next: () => this.loadUsers(),
  //     error: (err: any) => console.error(err)
  //   });
  // }

  // ✏️ Edit user
  editUser(user: any) {
    this.editMode = true;
    this.selectedUser = { ...user };
  }

  // ✅ Save updated user
  onUserUpdated(updatedUser: any) {
      this.userService.updateUser(updatedUser.id, updatedUser).subscribe({
      next: () => {
        this.editMode = false;
        this.selectedUser = null;
        this.loadUsers();
      },
      error: (err: any) => console.error(err)
    });
  }

  // ❌ Delete user (soft delete)
 deleteUser(id: any) {
  console.log("User object on delete:", id);  
  if (!confirm(`Are you sure you want to delete ${id}?`)) return;

  this.userService.deleteUser(id).subscribe({
    next: () => {
      this.users = this.users.filter(u => u.id !== id);
    },
    error: (err) => console.error("Delete error:", err)
  });
}




  // ❎ Close edit popup
  closeEditForm() {
    this.editMode = false;
    this.selectedUser = null;
  }

  // 🔁 Pagination trigger
  updatePagination() {
    this.applyFilter();
  }

  // 📌 Sorting from UI
  sortData(key: string) {
    this.sortKey = key;
    this.currentPage = 1; // Reset to first page on sort
    this.applySorting();
  }
}