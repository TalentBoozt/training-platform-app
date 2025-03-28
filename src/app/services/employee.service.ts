import { Injectable } from '@angular/core';
import { EmployeeModel } from "../shared/data-models/Employee.model";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {BehaviorSubject, catchError, Observable, tap, throwError} from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private employeesSubject = new BehaviorSubject<EmployeeModel[] | null>(null);
  employees$ = this.employeesSubject.asObservable();

  private cacheInitialized = false;
  private employeesCacheInitialized = false;

  // Fetch all employees with caching
  fetchEmployees(): Observable<EmployeeModel[]>|any {
    if (!this.employeesCacheInitialized) {
      this.http.get<EmployeeModel[]>(`${this.baseUrl}/employee/all`).subscribe(data => {
        this.employeesSubject.next(data);
        this.employeesCacheInitialized = true; // Cache is initialized after the first fetch
      });
    }
    return this.employees$;
  }

  // Get a single employee by ID, cannot cache because it's need to fetch other employee data
  getEmployee(id: any): Observable<any> {
    return this.http.get<EmployeeModel>(`${this.baseUrl}/employee/get/${id}`);
  }

  // Delete employee and invalidate cache
  deleteEmployee(id: any): Observable<any> {
    this.http.delete(`${this.baseUrl}/employee/delete/${id}`).subscribe(() => {
      this.clearCache();  // Clear cache after deletion
      this.fetchEmployees(); // Re-fetch all employees
    });

    return this.employees$;
  }

  deleteCompany(id: any): Observable<any> {
    this.http.delete(`${this.baseUrl}/employee/delete/company/${id}`).subscribe(() => {
      this.clearCache();  // Clear cache after deletion
      this.fetchEmployees(); // Re-fetch all employees
    });

    return this.employees$;
  }

  // Clear cache
  public clearCache() {
    this.cacheInitialized = false;
  }
}
