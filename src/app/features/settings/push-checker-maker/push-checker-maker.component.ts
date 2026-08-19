import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-push-checker-maker',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './push-checker-maker.component.html',
  styleUrl: './push-checker-maker.component.scss',
})
export class PushCheckerMakerComponent implements AfterViewInit {
  activeTab: number = 1;
  private router = inject(Router);

  ngAfterViewInit(): void {
    // Set initial active tab based on current route
    this.updateActiveTab(this.router.url);
    this.setActiveTab(1);
    // Subscribe to route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateActiveTab(event.url);
      });
  }

  private updateActiveTab(url: string): void {
    if (url.includes('pushMaker')) {
      this.activeTab = 1;
    } else if (url.includes('pushInit')) {
      this.activeTab = 2;
    } else if (url.includes('batchStatus')) {
      this.activeTab = 3;
    } else if (url.includes('batchEnquiry')) {
      this.activeTab = 4;
    } else {
      // Default to first tab if no match
      this.activeTab = 1;
    }
  }

  setActiveTab(tab: number): void {
    this.activeTab = tab;
    switch (tab) {
      case 1:
        this.router.navigate(['settings-form/pushCheckerMaker/pushMaker']);
        break;
      case 2:
        this.router.navigate(['settings-form/pushCheckerMaker/pushInit']);
        break;
      case 3:
        this.router.navigate(['settings-form/pushCheckerMaker/batchStatus']);
        break;
      case 4:
        this.router.navigate(['settings-form/pushCheckerMaker/batchEnquiry']);
        break;
    }
  }
}
