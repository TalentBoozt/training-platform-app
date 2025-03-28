import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {

  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  public addCourse(course: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/course/add`, course);
  }

  public getCoursesByOrganization(organization: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/course/company/${organization}`);
  }
}
