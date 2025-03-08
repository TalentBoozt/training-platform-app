import {Component, OnInit} from '@angular/core';
import {GoogleAuthService} from '../../../../services/authentication/google-auth.service';

@Component({
  selector: 'app-o-auth-callback',
  imports: [],
  templateUrl: './o-auth-callback.component.html',
  styleUrl: './o-auth-callback.component.scss',
  standalone: true
})
export class OAuthCallbackComponent implements OnInit{
  constructor(private googleAuthService: GoogleAuthService) {}

  ngOnInit(): void {
    this.googleAuthService.handleRedirectCallback();
  }
}
