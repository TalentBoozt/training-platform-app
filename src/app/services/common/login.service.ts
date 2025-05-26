import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private baseUrl = `${environment.apiUrlSimple}/public/logins`;

  constructor(private http: HttpClient) {}

  recordLogin(userId: string, metadata?: any) {
    const meta = {
      referrer: metadata.referrer,
      platform: metadata.platform,
      promotion: metadata.promotion,
      provider: metadata.provider,
      userAgent: metadata.userAgent,
      language: metadata.language,
      languages: metadata.languages,
      platformDetails: metadata.platformDetails,
      hardwareConcurrency: metadata.hardwareConcurrency,
      deviceMemory: metadata.deviceMemory,
      cookiesEnabled: metadata.cookiesEnabled,
      onlineStatus: metadata.onlineStatus,
      location: metadata.location
    }
    return this.http.post(`${this.baseUrl}/${userId}/record`, meta);
  }

  getLoginDates(userId: string, year: number) {
    return this.http.get<string[]>(`${this.baseUrl}/${userId}/year/${year}`);
  }
}
