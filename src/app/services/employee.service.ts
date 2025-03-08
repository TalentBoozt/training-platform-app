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

  // BehaviorSubject to store the employee data
  private employeeSubject = new BehaviorSubject<EmployeeModel | null>(null);
  employee$ = this.employeeSubject.asObservable();
  private employeesSubject = new BehaviorSubject<EmployeeModel[] | null>(null);
  employees$ = this.employeesSubject.asObservable();

  private cacheInitialized = false;
  private employeesCacheInitialized = false;

  // Fetch all employees with caching
  fetchEmployees(): Observable<EmployeeModel[]>|any {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });

    if (!this.employeesCacheInitialized) {
      this.http.get<EmployeeModel[]>(`${this.baseUrl}/employee/all`, {headers}).subscribe(data => {
        this.employeesSubject.next(data);
        this.employeesCacheInitialized = true; // Cache is initialized after the first fetch
      });
    }
    return this.employees$;
  }

  // Get a single employee by ID, cannot cache because it's need to fetch other employee data
  getEmployee(id: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.get<EmployeeModel>(`${this.baseUrl}/employee/get/${id}`, {headers});
  }

  // Fetch all employee-related data asynchronously (from async batch API) with caching
  fetchFullEmployee(id: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });

    // Use the cache if initialized
    if (this.cacheInitialized) {
      return this.employee$; // Return the cached employee data as observable
    }

    // Fetch from API and cache
    return this.http.get<any>(`${this.baseUrl}/batch/async/getEmployee/${id}`, { headers }).pipe(
      tap((data) => {
        this.employeeSubject.next(data); // Cache main employee data
        this.cacheInitialized = true;
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    );
  }

  // Delete employee and invalidate cache
  deleteEmployee(id: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });

    this.http.delete(`${this.baseUrl}/employee/delete/${id}`, {headers}).subscribe(() => {
      this.clearCache();  // Clear cache after deletion
      this.fetchEmployees(); // Re-fetch all employees
    });

    return this.employees$;
  }

  deleteCompany(id: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });

    this.http.delete(`${this.baseUrl}/employee/delete/company/${id}`, {headers}).subscribe(() => {
      this.clearCache();  // Clear cache after deletion
      this.fetchEmployees(); // Re-fetch all employees
    });

    return this.employees$;
  }

  // Update employee's personal details and refresh cache
  updateEmployee(employee: EmployeeModel): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    this.http.put(`${this.baseUrl}/employee/update` , employee, {headers}).subscribe(data => {
      this.clearCache(); // Invalidate the cache
      this.fetchFullEmployee(employee.id); // Refresh the cache after updating
    });

    return this.employees$;
  }

  updateSearchAppearance(employee: EmployeeModel): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    this.http.put(`${this.baseUrl}/employee/update/sa` , employee, {headers}).subscribe(data => {
      this.clearCache(); // Invalidate the cache
      this.fetchFullEmployee(employee.id); // Refresh the cache after updating
    });

    return this.employees$;
  }

  updateNotifications(employee: EmployeeModel): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    this.http.put(`${this.baseUrl}/employee/update/notifications` , employee, {headers}).subscribe(data => {

    });

    return this.employees$;
  }

  updateProfilePic(employee: EmployeeModel): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    this.http.put(`${this.baseUrl}/employee/update/updateProfilePic` , employee, {headers}).subscribe(data => {
      this.clearCache(); // Invalidate the cache
      this.fetchFullEmployee(employee.id); // Refresh the cache after updating
    });

    return this.employee$;
  }

  updateCoverPic(employee: EmployeeModel): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    this.http.put(`${this.baseUrl}/employee/update/updateCoverPic` , employee, {headers}).subscribe(data => {
      this.clearCache(); // Invalidate the cache
      this.fetchFullEmployee(employee.id); // Refresh the cache after updating
    });

    return this.employee$;
  }

  updateResume(employee: EmployeeModel): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    this.http.put(`${this.baseUrl}/employee/update/updateResume` , employee, {headers}).subscribe(data => {
      this.clearCache(); // Invalidate the cache
      this.fetchFullEmployee(employee.id); // Refresh the cache after updating
    });

    return this.employee$;
  }

  addSkills(skills: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.post(`${this.baseUrl}/emp_skills/add` , skills, {headers}).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(skills.employeeId); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    )
  }

  deleteSkill(employeeId: string, skillId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.delete(`${this.baseUrl}/emp_skills/delete-single/${employeeId}/${skillId}`, { headers }).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(employeeId); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    );
  }

  editSkill(employeeId: string, updatedSkill: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.put(`${this.baseUrl}/emp_skills/edit-single/${employeeId}`, updatedSkill, { headers }).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(employeeId); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    );
  }

  addExperience(experience: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.post(`${this.baseUrl}/emp_experiences/add` , experience, {headers}).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(experience.employeeId); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    )
  }

  deleteExperience(employeeId: string, experienceId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.delete(`${this.baseUrl}/emp_experiences/delete-single/${employeeId}/${experienceId}`, { headers }).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(employeeId); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    );
  }

  editExperience(employeeId: string, updatedExperience: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.put(`${this.baseUrl}/emp_experiences/edit-single/${employeeId}`, updatedExperience, { headers }).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(employeeId); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    );
  }

  addEducation(education: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.post(`${this.baseUrl}/emp_education/add` , education, {headers}).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(education.employeeId); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    )
  }

  deleteEducation(employeeId: string, educationId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.delete(`${this.baseUrl}/emp_education/delete-single/${employeeId}/${educationId}`, { headers }).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(employeeId); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    );
  }

  editEducation(employeeId: string, updatedEducation: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.put(`${this.baseUrl}/emp_education/edit-single/${employeeId}`, updatedEducation, { headers }).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(employeeId); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    );
  }

  addProject(project: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.post(`${this.baseUrl}/emp_projects/add` , project, {headers}).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(project.employeeId); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    )
  }

  deleteProject(employeeId: string, projectId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.delete(`${this.baseUrl}/emp_projects/delete-single/${employeeId}/${projectId}`, { headers }).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(employeeId); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    );
  }

  editProject(employeeId: string, updatedProject: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.put(`${this.baseUrl}/emp_projects/edit-single/${employeeId}`, updatedProject, { headers }).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(employeeId); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    );
  }

  addCertificate(certificate: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.post(`${this.baseUrl}/emp_certificates/add` , certificate, {headers}).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(certificate.employeeId); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    )
  }

  deleteCertificate(employeeId: string, certificateId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.delete(`${this.baseUrl}/emp_certificates/delete-single/${employeeId}/${certificateId}`, { headers }).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(employeeId); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    );
  }

  editCertificate(employeeId: string, updatedCertificate: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.put(`${this.baseUrl}/emp_certificates/edit-single/${employeeId}`, updatedCertificate, { headers }).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(employeeId); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    );
  }

  addContact(contact: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.post(`${this.baseUrl}/emp_contact/add` , contact, {headers}).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(contact.employeeId); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    )
  }

  addSocial(social: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.post(`${this.baseUrl}/emp_contact/add-social` , social, {headers}).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(social.employeeId); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    )
  }

  changeContactPublicity(id:any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.put(`${this.baseUrl}/emp_contact/publicity/${id}`, null, { headers }).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(id); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    );
  }

  editContact(employeeId: string, contact: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.put(`${this.baseUrl}/emp_contact/update-contact/${employeeId}`, contact, { headers }).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(contact.employeeId); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    );
  }

  editSocial(employeeId: string, social: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.put(`${this.baseUrl}/emp_contact/update-social/${employeeId}`, social, { headers }).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(social.employeeId); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    );
  }

  addFollower(follower: any): Observable<any> { //this method always call in add following method's block.
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.post(`${this.baseUrl}/emp_followers/add` , follower, {headers}).pipe(
      tap((data) => {
        this.clearCache();
        this.fetchFullEmployee(follower.employeeId);
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    )
  }

  deleteFollower(employeeId: string, followerId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.delete(`${this.baseUrl}/emp_followers/delete-single/${employeeId}/${followerId}`, { headers }).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(employeeId); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    );
  }

  addFollowing(following: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.post(`${this.baseUrl}/emp_followings/add` , following, {headers}).pipe(
      tap((data) => {
        this.clearCache();
        this.fetchFullEmployee(following.employeeId);
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    )
  }

  deleteFollowing(employeeId: string, followingId: string): Observable<any> { //this method always call in delete follower method's block.
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.delete(`${this.baseUrl}/emp_followings/delete-single/${employeeId}/${followingId}`, { headers }).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(employeeId); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    );
  }

  saveFavJobs(employeeId: string, favJobs: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.put(`${this.baseUrl}/employee/save-job/${employeeId}`, favJobs, { headers }).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(employeeId); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    );
  }

  removeFavJobs(employeeId: string, jobId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.put(`${this.baseUrl}/employee/remove-job/${employeeId}/${jobId}`,[], { headers }).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(employeeId); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    );
  }

  editFavJobStatus(employeeId: string, favJob: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    return this.http.put(`${this.baseUrl}/employee/update/saved-job/status/${employeeId}`, favJob, { headers }).pipe(
      tap((data) => {
        this.clearCache(); // Invalidate the cache
        this.fetchFullEmployee(employeeId); // Refresh the cache after updating
      }),
      catchError((error) => {
        return throwError(error); // Re-throw the error so that the component can handle it
      })
    );
  }

  // Clear cache
  public clearCache() {
    this.cacheInitialized = false;
    this.employeeSubject.next(null);
  }

  private clearEmployeesCache() {
    this.employeesCacheInitialized = false;
    this.employeesSubject.next(null);
  }
}
