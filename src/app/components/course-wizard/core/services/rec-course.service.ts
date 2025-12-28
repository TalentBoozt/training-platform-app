import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class RecCourseService {

    private baseUrlSimple = 'https://api.talentboozt.com';
    private baseUrl = 'https://api.talentboozt.com/api/v2';

    categoriesSubject = new BehaviorSubject<any[] | null>(null);
    categories$ = this.categoriesSubject.asObservable();

    isCategoriesLoaded = false;

    constructor(private http: HttpClient) { }

    public getAllCategories(): Observable<any> {
        if (!this.isCategoriesLoaded) {
            this.http.get<any>(`${this.baseUrlSimple}/public/recorded-courses/categories`).subscribe(data => {
                this.categoriesSubject.next(data);
                this.isCategoriesLoaded = true;
            });
        }
        return this.categories$;
    }

    addCourse(course: any): Observable<any> {
        const url = `${this.baseUrlSimple}/public/recorded-courses/add`;
        return this.http.post<any>(url, course);
    }

    createStripeProduct(payload: any, courseName: string): Observable<any> {
        const name = courseName.replace(' ', '-');
        return this.http.post<any>(`${this.baseUrl}/payments/recorded/create/stripe/product/${name}`, payload);
    }
}
