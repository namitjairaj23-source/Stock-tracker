import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddUserComponent } from '../add-user/add-user.component';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { UserService } from '../../user.service';
import { User } from '../../user/user.module'; 

@Component({
  selector: 'app-form-host',
  standalone: true,
  imports: [CommonModule, AddUserComponent, EditUserComponent],
  templateUrl: './form-host.component.html',
  styleUrls: ['./form-host.component.css']
})
export class FormHostComponent implements OnInit {
  action: 'add' | 'edit' = 'add';
  user: User | null = null;
  selectedUser!: User | null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
  this.userService.action$.subscribe(action => {
  console.log('→ [FormHost] action is now:', action);
  this.action = action || 'add';
});

this.userService.selectedUser$.subscribe(user => {
  console.log('→ [FormHost] selectedUser is now:', user);
  this.user = user;
});

  }}