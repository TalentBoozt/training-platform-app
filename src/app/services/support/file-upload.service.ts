import { Injectable, inject } from '@angular/core';
import {Storage, ref, uploadBytes, getDownloadURL, deleteObject} from '@angular/fire/storage';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private storage = inject(Storage);

  uploadFile(filePath: string, file: File): Observable<string> {
    const fileRef = ref(this.storage, filePath);

    return from(
      uploadBytes(fileRef, file).then(() => getDownloadURL(fileRef))
    );
  }

  deleteFile(fileUrl: string): Observable<void> {
    const decodedUrl = decodeURIComponent(fileUrl);
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
    const pathIndex = decodedUrl.indexOf(baseUrl) >= 0 ? decodedUrl.split('?')[0].split(baseUrl)[1] : null;

    if (!pathIndex) {
      throw new Error('Invalid Firebase URL.');
    }

    const fullPath = decodedUrl.split('/o/')[1]?.split('?')[0]?.replace(/%2F/g, '/');
    const fileRef = ref(this.storage, fullPath);

    return from(deleteObject(fileRef));
  }
}
