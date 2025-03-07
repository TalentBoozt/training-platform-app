import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
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
}
