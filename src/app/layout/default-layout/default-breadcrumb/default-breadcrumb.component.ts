import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { BreadcrumbRouterComponent, RowComponent } from '@coreui/angular-pro';

@Component({
  selector: 'app-default-breadcrumb',
  standalone: true,
  imports: [
    BreadcrumbRouterComponent,
    RowComponent
  ],
  styleUrl: './default-breadcrumb.component.scss',
  templateUrl: './default-breadcrumb.component.html',
})
export class DefaultBreadcrumbComponent {

  public title!: string;
  readonly #router = inject(Router);

  constructor() {
    this.#router.events.pipe(
      filter(event => event instanceof ActivationEnd && !event.snapshot.firstChild),
      map(value => {
        const activatedRoute = <ActivatedRoute><unknown>value;
        return activatedRoute.snapshot?.data?.['title'] ?? null;
      }),
      takeUntilDestroyed()
    ).subscribe((title: string | null) => {
      this.title = title ?? 'Title';
    });
  }

}
