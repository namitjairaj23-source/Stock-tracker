// src/app/utils/pdf-export.ts

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportUsersToPDF(users: any[]) {
  const doc = new jsPDF();
  doc.text('User Data Export', 14, 15);

  const columns = [
    'Full Name',
    'State',
    'District',
    'Share Name',
    'Share Qty',
    'Share Rate',
    'Share Amount',
    'Authorized Person',
    'Date'
  ];

  const rows = users.map((user) => [
    `${user.fullName.firstname} ${user.fullName.lastname}`,
    user.state,
    user.district,
    user.shareName,
    user.shareQty,
    user.ShareRate,
    user.shareAmount,
    user.authorizedPerson,
    user.createdDate
  ]);
  
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 20
  });

  doc.save('user-data.pdf');
}
