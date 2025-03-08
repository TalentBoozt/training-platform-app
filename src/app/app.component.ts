import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, RouterOutlet} from '@angular/router';
import {HeaderComponent} from './components/shared/header/header.component';
import {AuthService} from './services/support/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true
})
export class AppComponent implements OnInit {
  title = 'training-platform-app';

  constructor(private route: ActivatedRoute, private cookieService: AuthService) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const platform = params['platform'] || 'TrainingPlatform';
      const ref = params['ref'] || '';
      const promo = params['promo'] || '';
      this.cookieService.createPlatform(platform);
      this.cookieService.createReferer(ref);
      this.cookieService.createPromotion(promo);
    });
  }
}
