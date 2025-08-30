import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {QuizDTO} from '../shared/data-models/QuizDTO';

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

  public updateWithNewBatch(id: any, course: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/course/update-new-batch/${id}`, course);
  }

  public deleteCourse(id: any): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/course/delete/${id}`);
  }

  public updateInstallmentPaymentStatus(eid: any, cid: any, iid: any, status: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/emp-courses/update-installment-payment/${eid}/${cid}/${iid}/${status}`, {});
  }

  public updateInstallmentPaymentStatusFullCourse(eid: any, cid: any, iid: any, status: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/emp-courses/update-full-payment/${eid}/${cid}/${iid}/${status}`, {});
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

  public updateCourseStatus(courseId: any, status: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/course/update-status/${courseId}/${status}`, {});
  }

  public toggleAudience(courseId: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/course/update-publicity/${courseId}`, {});
  }

  public addMaterial(material: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/course/add/material/${material.courseId}`, material);
  }

  public deleteMaterial(courseId: any, id: any): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/course/delete/material/${courseId}/${id}`);
  }

  public updateMaterial(dto: any) {
    return this.http.put<any>(`${this.baseUrl}/course/update/material/${dto.courseId}/${dto.id}`, dto);
  }

  public changeMaterialVisibility(courseId: any, id: any, status: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/course/visibility/material/${courseId}/${id}/${status}`, {});
  }

  public createQuiz(quizData: QuizDTO) {
    return this.http.post<any>(`${this.baseUrl}/course/add/quiz/${quizData.courseId}`, quizData);
  }

  public deleteQuiz(courseId: any, id: any): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/course/delete/quiz/${courseId}/${id}`);
  }

  public updateQuiz(quiz: QuizDTO) {
    return this.http.put<any>(`${this.baseUrl}/course/update/quiz/${quiz.courseId}/${quiz.id}`, quiz);
  }

  public getQuizById(courseId: any, quizId: any) {
    return this.http.get<any>(`${this.baseUrl}/course/get/quiz/${courseId}/${quizId}`);
  }

  public changeQuizVisibility(courseId: any, id: any, status: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/course/visibility/quiz/${courseId}/${id}/${status}`, {});
  }

  public createStripeProduct(course: string, name: string, currency: string, price: string) {
    const courseName = course.replace(' ', '-');
    return this.http.post<any>(`${this.baseUrl}/course/create/stripe/product/${courseName}`, {name, currency, price});
  }

  public submitQuiz(quiz: any) {
    return this.http.post<any>(`${this.baseUrl}/course/quiz/submit`, quiz);
  }

  public getAttempts(courseId: any, userId: any) {
    return this.http.get<any>(`${this.baseUrl}/course/quiz/attempts/${courseId}/${userId}`);
  }
}
