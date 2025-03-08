import {Component, OnInit} from '@angular/core';
import {LinkedInAuthService} from '../../../../services/authentication/linked-in-auth.service';
import {WindowService} from '../../../../services/common/window.service';

@Component({
  selector: 'app-o-auth-callback-linkedin',
  imports: [],
  templateUrl: './o-auth-callback-linkedin.component.html',
  styleUrl: './o-auth-callback-linkedin.component.scss',
  standalone: true
})
export class OAuthCallbackLinkedinComponent implements OnInit {
  constructor(private linkedInAuthService: LinkedInAuthService, private windowService: WindowService) {}

  ngOnInit() {
    if (this.windowService.nativeWindow && this.windowService.nativeLocalStorage) {
      const urlParams = new URLSearchParams((window as any).location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const storedState = (localStorage as any).getItem('linkedin_auth_state');

      this.linkedInAuthService.handleLinkedInCallback(urlParams, code, state, storedState);
    }
  }
}
