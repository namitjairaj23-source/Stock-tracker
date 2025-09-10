// ✅ Angular service banaya gaya hai jo ki User data ka management karega.
// is service ka kaam hoga:
// 1. Backend (Node/Express + MySQL) ke sath connect hona
// 2. Users ko add, edit, delete karna
// 3. Current UI state (home, form, add, edit) ko manage karna
// 4. Excel aur PDF export provide karna

import { Injectable, signal } from '@angular/core';        
// Injectable: Angular me service banane ke liye use hota hai
// signal: Angular ka naya reactive feature (BehaviorSubject ka alternative)

import { BehaviorSubject, Observable } from 'rxjs';        
// BehaviorSubject: ek special stream hai jo latest value ko store karke subscribers ko deta hai
// Observable: async data stream jisko Angular components subscribe karte hain

import * as XLSX from 'xlsx';                              
// XLSX: Excel export ke liye library

import * as FileSaver from 'file-saver';                   
// FileSaver: client ke computer me file download/save karane ke liye

import { exportUsersToPDF } from './utils/pdf-export';     
// Custom utility function jisse PDF banate hain

import { User } from './user/user.module';                 
// User model (TypeScript interface) jo user ke fields define karta hai

import { HttpClient } from '@angular/common/http';         
// HttpClient: Angular ka HTTP request service (backend API se baat karne ke liye)

import { map } from 'rxjs/operators';                      
// map: RxJS operator jo API se aaye data ko transform karta hai


@Injectable({ providedIn: 'root' })                        
// @Injectable: is service ko Angular DI system me register karta hai
// providedIn: 'root' ka matlab hai ki ye app-wide singleton service hoga
export class UserService {
  private apiUrl = 'http://localhost:3000';               
  // backend API ka base URL (yahi pe request bhejna hai)

  // ============ Local State Management ============
  private users: any[] = [];                              
  // Users ka ek local array jisme current users list rakhi jaayegi

  private usersSubject = new BehaviorSubject<any[]>([]);  
  // BehaviorSubject users ke list ko reactive bana raha hai
  // iska matlab: jo bhi component subscribe karega, usko latest users milte rahenge

  users$ = this.usersSubject.asObservable();              
  // Public observable banaya gaya hai, jisko Angular components use karenge

  private viewSubject = new BehaviorSubject<string>('home'); 
  // Current view (home ya form) ka state rakhta hai

  view$ = this.viewSubject.asObservable();                   
  // Public observable jisse UI ko pata chalega ki abhi kaunsa view dikhana hai

  private actionSubject = new BehaviorSubject<'add' | 'edit' | null>(null); 
  // Current action ka state rakhta hai (add/edit ya null)

  action$ = this.actionSubject.asObservable();                             

  private selectedUserSubject = new BehaviorSubject<any | null>(null); 
  // Abhi kaunsa user select kiya gaya hai (edit karne ke liye)

  selectedUser$ = this.selectedUserSubject.asObservable();             

  private _selectedUserSignal = signal<any | null>(null);  
  // Angular signal (BehaviorSubject ka ek modern alternative)

  constructor(private http: HttpClient) {}                 
  // constructor me HttpClient inject kiya gaya hai taki API request bheji ja sake

  // 🔎 Current action (add/edit) ko turant lene ke liye helper method
  getCurrentAction(): 'add' | 'edit' | null {
    return this.actionSubject.getValue();
  }

  // ============ API CALLS ============

  /** 📥 Backend se saare users laana */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  /** 🔄 Users ko reload karke local state me daalna */
  loadUsers(): void {
    this.getUsers().subscribe({
      next: (users) => {
        this.users = users;                
        this.usersSubject.next(this.users); 
      },
      error: (err) => console.error('Failed to load users', err)
    });
  }

  /** ➕ Naya user add karna */
  addUser(user: any): Observable<any> {
    return this.http.post<User>(`${this.apiUrl}/users`, user);
  }

  /** ✏️ Existing user ko update karna */
  updateUser(id: number, user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, user);
  }

  /** ❌ User ko delete karna */
  deleteUser(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  /** 🔍 Email check karna (already exist hai ya nahi) */
  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      map(users => users.some(u => u.email === email)) 
    );
  }

  // ============ UI STATE MANAGEMENT ============

  /** Add form dikhana */
  showAddForm(): void {
    this.viewSubject.next('form');   
    this.actionSubject.next('add');  
    this.setSelectedUser(null);      
  }

  /** Edit form dikhana (user ke data ke sath) */
  showEditForm(user: User): void {
    this.viewSubject.next('form');   
    this.actionSubject.next('edit'); 
    this.setSelectedUser(user);      
  }

  /** Home view dikhana */
  showHome(): void {
    this.viewSubject.next('home');   
    this.actionSubject.next(null);   
    this.setSelectedUser(null);      
  }

  /** View manually set karna */
  setView(view: string): void {
    this.viewSubject.next(view);
  }

  /** Action manually set karna */
  setAction(action: 'add' | 'edit'): void {
    this.actionSubject.next(action);
  }

  /** Selected user set karna */
  setSelectedUser(user: User | null): void {
    this.selectedUserSubject.next(user); 
    this._selectedUserSignal.set(user);  
  }

  /** Selected user ko direct fetch karna (synchronously) */
  getSelectedUser(): User | null {
    return this.selectedUserSubject.getValue();
  }

  // ============ EXPORT HELPERS ============

  /** 📤 Users ko Excel file me export karna */
  exportToExcel(): void {
    const exportData = this.users.map((user) => ({
      Name: `${user.fullName || ''}`.trim(),
      Email: user.email || '',
      State: user.state || '',
      District: user.district || '',
      'Share Name': user.ShareName || '',
      Qty: user.ShareQty || '',
      Rate: user.ShareRate || '',
      Amount: user.ShareAmount || '',
      Date: user.date || '',
      AuthorizedPerson: user.authorizedPerson || ''
    }));

    // JSON → Excel sheet convert karna
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Excel file client ke system me save karna
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, 'users.xlsx');
  }

  /** 📤 Users ko PDF me export karna */
  exportToPDF(): void {
    exportUsersToPDF(this.users); 
  }
}
