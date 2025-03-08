import {Component, OnInit} from '@angular/core';
import {GitHubAuthService} from '../../../../services/authentication/git-hub-auth.service';

@Component({
  selector: 'app-o-auth-callback-github',
  imports: [],
  templateUrl: './o-auth-callback-github.component.html',
  styleUrl: './o-auth-callback-github.component.scss',
  standalone: true
})
export class OAuthCallbackGithubComponent implements OnInit{
  constructor(private githubAuthService: GitHubAuthService) {}

  ngOnInit(): void {
    this.githubAuthService.handleRedirectCallback();
  }
}
