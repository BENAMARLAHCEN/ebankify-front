import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SweetAlertService {
  success(title: string, text?: string) {
    return Swal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonColor: '#3B82F6',
      timer: 3000
    });
  }

  error(title: string, text?: string) {
    return Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonColor: '#EF4444'
    });
  }

  confirm(title: string, text: string, confirmText = 'Yes', cancelText = 'No') {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#EF4444',
      confirmButtonText: confirmText,
      cancelButtonText: cancelText
    });
  }

  processing() {
    return Swal.fire({
      title: 'Processing',
      html: 'Please wait...',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });
  }
}