import { Injectable } from '@angular/core';
import {TrainerProfile} from '../shared/data-models/TrainerProfile';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrainerProfileService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProfile(employeeId: string): Observable<TrainerProfile> {
    return this.http.get<TrainerProfile>(`${this.baseUrl}/trainers/${employeeId}`);
  }

  updateProfile(profile: TrainerProfile): Observable<TrainerProfile> {
    return this.http.put<TrainerProfile>(`${this.baseUrl}/trainers/update/empId/${profile.employeeId}`, profile);
  }
}
