import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RepoUrlCacheService {
  static readonly KEY_NAME = 'suggestions';

  suggestions: string[];

  constructor() {
    this.suggestions = JSON.parse(window.localStorage.getItem(RepoUrlCacheService.KEY_NAME)) || [];
  }

  cache(repo: string): void {
    // Update autofill repository URL suggestions in localStorage
    if (!this.suggestions.includes(repo)) {
      this.suggestions.push(repo);
      window.localStorage.setItem(RepoUrlCacheService.KEY_NAME, JSON.stringify(this.suggestions));
    }
  }

  removeFromSuggestions(repo: string): void {
    this.suggestions = this.suggestions.filter(r => r !== repo);
    window.localStorage.setItem(RepoUrlCacheService.KEY_NAME, JSON.stringify(this.suggestions));
  }

  getFilteredSuggestions(control: AbstractControl): Observable<string[]> {
    // Ref: https://v10.material.angular.io/components/autocomplete/overview
    return control.valueChanges.pipe(
      startWith(''),
      map((value) => this.suggestions.filter((suggestion) => suggestion.toLowerCase().includes(value.toLowerCase())))
    );
  }
}
