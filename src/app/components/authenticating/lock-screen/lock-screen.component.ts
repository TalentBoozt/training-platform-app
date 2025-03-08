import {AfterViewInit, Component, OnInit} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../services/support/auth.service';
import {CredentialService} from '../../../services/credential.service';
import {EncryptionService} from '../../../services/support/encryption.service';
import {EmployeeService} from '../../../services/employee.service';
import {Router} from '@angular/router';
import {AlertsService} from '../../../services/support/alerts.service';
import {WindowService} from '../../../services/common/window.service';

@Component({
  selector: 'app-lock-screen',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './lock-screen.component.html',
  styleUrl: './lock-screen.component.scss',
  standalone: true
})
export class LockScreenComponent implements OnInit, AfterViewInit{
  employeeId:any;
  employee: any;

  unlockForm = new FormGroup({
    password: new FormControl('', [Validators.required])
  })
  constructor(private cookieService: AuthService,
              private credentialService: CredentialService,
              private encryptionService: EncryptionService,
              private employeeService: EmployeeService,
              private windowService: WindowService,
              private router: Router,
              private alertService: AlertsService ) {}

  ngOnInit() {
    this.cookieService.lock();
    this.employeeId = this.cookieService.userID();
    this.getEmployee(this.employeeId)
  }

  ngAfterViewInit() {
    if (this.windowService.nativeDocument){
      const icons = document.querySelectorAll('.material-icons');
      icons.forEach((icon) => {
        icon.setAttribute('translate', 'no');
      });
    }
  }

  getEmployee(id: any) {
    this.employeeService.getEmployee(id).subscribe(
      (data) => {
        this.employee = data;
      },
      (error: HttpErrorResponse) => {
        // console.log(error)
      }
    );
  }

  unlockUser() {
    this.credentialService.fetchCredentialByEmployeeId(this.employeeId).subscribe(async (response: any) => {
      if (response) {
        const encryptedPassword = await this.encryptionService.decryptPassword(response.password?.toString());
        if (this.unlockForm.valid) {
          if (this.unlockForm.value.password === encryptedPassword) {
            this.cookieService.unlock();
            this.alertService.successMessage('Profile Unlocked!', 'Success');
            this.router.navigate(['/']);
          } else {
            this.alertService.errorMessage('Wrong Password', 'Error');
          }
        } else {
          this.alertService.errorMessage('Please Enter Your Password', 'Error');
        }
      }
    });
  }
}
