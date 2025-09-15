import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-delete-users',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './delete-users.component.html',
  styleUrls: ['./delete-users.component.css']
})
export class DeleteUsersComponent implements OnInit {
  deletedUsers: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDeletedUsers();
  }

  loadDeletedUsers() {
  this.http.get<any[]>('http://localhost:3000/delete-user').subscribe({
    next: (res) => {
      this.deletedUsers = res;
    },
    error: (err) => {
      console.error('Error fetching deleted users:', err);
    }
  });
}

}
