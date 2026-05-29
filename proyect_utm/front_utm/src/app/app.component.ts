import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { NotificationService } from './services/notification.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  title = 'evaluacion-eventos-utm';
  showHeader = true;
  showFooter = true;
  isAuthenticated = false;
  hasSidebar = false;
  loading = false;

  private subs = new Subscription();

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {
    this.subs.add(
      this.notificationService.loading$.pipe(delay(0)).subscribe((v: boolean) => this.loading = v)
    );
    this.subs.add(
      this.authService.currentUser$.subscribe((user: any) => {
        this.isAuthenticated = !!user;
        this.showHeader = true;
      })
    );

    this.subs.add(
      this.router.events.subscribe((event: any) => {
        if (event.url) {
          this.hasSidebar = event.url.includes('/admin');
        }
      })
    );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}