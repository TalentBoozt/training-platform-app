import { AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';

export function emailExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        // Simulate async email existence check (e.g., HTTP request)
        const existingEmails = ['test@example.com', 'demo@example.com'];
        if (existingEmails.includes(control.value)) {
            return of({ emailExists: true });
        }
        return of(null); // No error
    };
}
