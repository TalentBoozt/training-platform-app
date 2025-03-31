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
}
