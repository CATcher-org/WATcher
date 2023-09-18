import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ErrorHandlingService } from '../services/error-handling.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {
  NOT_AUTHENTICATED_ERROR: Error = new Error('Login required');

  constructor(private auth: AuthService, private router: Router, private errorHandlingService: ErrorHandlingService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.auth.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['']);
      this.errorHandlingService.handleError(this.NOT_AUTHENTICATED_ERROR);
      return false;
    }
  }

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    if (this.auth.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['']);
      this.errorHandlingService.handleError(this.NOT_AUTHENTICATED_ERROR);
      return false;
    }
  }
}
