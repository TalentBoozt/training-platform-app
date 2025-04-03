import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {

  baseUrl = environment.apiUrl;

  categoriesSubject = new BehaviorSubject<any[] | null>(null);
  categories$ = this.categoriesSubject.asObservable();

  isCategoriesLoaded = false;

  constructor(private http: HttpClient) { }

  public addCourse(course: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/course/add`, course);
  }

  public getCoursesByOrganization(organization: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/course/company/${organization}`);
  }

  public getAllCategories(): Observable<any> {
    if (!this.isCategoriesLoaded) {
      this.http.get<any>(`${this.baseUrl}/course/get/categories`).subscribe(data => {
        this.categoriesSubject.next(data);
        this.isCategoriesLoaded = true;
      });
    }
    return this.categories$;
  }

  public getFullParticipants(courseId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/batch/getParticipants/${courseId}`);
  }

  public getParticipants(courseId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/course/get/${courseId}/users`);
  }

  public getOverviewByCompany(organization: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/course/overview/${organization}`);
  }

  public editCourse(id: any, course: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/course/update/${id}`, course);
  }

  public deleteCourse(id: any): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/course/delete/${id}`);
  }

  public updateInstallmentPaymentStatus(eid: any, cid: any, iid: any, status: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/emp-courses/update-installment-payment/${eid}/${cid}/${iid}/${status}`, {});
  }

  public updateEnrollmentStatus(eid: any, cid: any, status: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/emp-courses/update-enrollment-status/${eid}/${cid}/${status}`, {});
  }

  public getCourseById(id: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/course/get/${id}`);
  }

  public updateModule(courseId: any, module: any){
    return this.http.put<any>(`${this.baseUrl}/course/update-module/${courseId}`, module)
  }

  public deleteModule(courseId: any, moduleId: any){
    return this.http.delete<any>(`${this.baseUrl}/course/delete-module/${courseId}/${moduleId}`)
  }
}
