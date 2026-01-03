import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RecCoursesService {

  baseUrl = environment.apiUrl
  baseUrlSimple = environment.apiUrlSimple

  private recCoursesSubject = new BehaviorSubject<any[] | null>(null);
  recCourses$ = this.recCoursesSubject.asObservable();

  private recCoursesCacheInitialized = false;

  constructor(private http: HttpClient) { }

  getPublishedCourses(): Observable<any> {  //just published can be not approved
    if (!this.recCoursesCacheInitialized) {
      this.recCoursesCacheInitialized = true;
      this.http.get<any[]>(this.baseUrl + '/recorded-courses/get-published').subscribe(
        (data) => {
          this.recCoursesSubject.next(data);
        }
      );
    }
    return this.recCourses$;
  }

  getCoursesByCompanyId(companyId: string): Observable<any> {
    return this.http.get<any[]>(this.baseUrl + '/recorded-courses/get-by-company/' + companyId);
  }

  getCoursesByTrainerId(trainerId: string): Observable<any> {
    return this.http.get<any[]>(this.baseUrl + '/recorded-courses/get-by-trainer/' + trainerId);
  }

  getCourseById(id: string) {
    return this.http.get<any>(this.baseUrl + '/recorded-courses/get/' + id);
  }

  updateCourse(id: string, course: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/recorded-courses/update/${id}`, course);
  }

  deleteCourse(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/recorded-courses/delete/${id}`);
  }

  approveCourse(id: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/recorded-courses/approve/${id}`, {});
  }

  rejectCourse(id: string, rejectRecCourseDTO: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/recorded-courses/reject/${id}`, rejectRecCourseDTO);
  }

  addReview(id: string, review: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/recorded-courses/add-review/${id}`, review);
  }

  // TODO: Implement backend endpoint for adding a module
  addModule(courseId: string, module: any): Observable<any> {
    // return this.http.post<any>(`${this.baseUrl}/recorded-courses/add-module/${courseId}`, module);
    console.log('TODO: addModule', courseId, module);
    return new Observable(observer => {
      observer.next(module);
      observer.complete();
    });
  }

  // TODO: Implement backend endpoint for updating a module
  updateModule(courseId: string, module: any): Observable<any> {
    // return this.http.put<any>(`${this.baseUrl}/recorded-courses/update-module/${courseId}`, module);
    console.log('TODO: updateModule', courseId, module);
    return new Observable(observer => {
      observer.next(module);
      observer.complete();
    });
  }

  // TODO: Implement backend endpoint for deleting a module
  deleteModule(courseId: string, moduleId: string): Observable<any> {
    // return this.http.delete<any>(`${this.baseUrl}/recorded-courses/delete-module/${courseId}/${moduleId}`);
    console.log('TODO: deleteModule', courseId, moduleId);
    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  // TODO: Implement backend endpoint for adding a lecture
  addLecture(courseId: string, moduleId: string, lecture: any): Observable<any> {
    // return this.http.post<any>(`${this.baseUrl}/recorded-courses/add-lecture/${courseId}/${moduleId}`, lecture);
    console.log('TODO: addLecture', courseId, moduleId, lecture);
    return new Observable(observer => {
      observer.next(lecture);
      observer.complete();
    });
  }

  public makePaymentRecorded(installment: any) {
    return this.http.post<any>(`${this.baseUrlSimple}/stripe/create-checkout-session/recorded-course`, installment);
  }
}
