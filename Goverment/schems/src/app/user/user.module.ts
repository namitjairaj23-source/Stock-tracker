// src/app/user/user.model.ts
export interface User {
  id?: number;
  
  firstname: string;
  lastname: string;

  
  fullName?: string;

  email: string;
  password: string;
  role: 'admin' | 'user';

  state?: string;
  district?: string;
  date?: string;  
  ShareName?: string;
  ShareQty?: number;
  ShareRate?: number;
  ShareAmount?: number;
  authorizedPerson?: string;

  photoUrl?: string;
  uploadedPhotos?: string[];
}
