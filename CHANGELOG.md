### [coreui-pro-angular-admin-template](https://coreui.io/angular/) changelog

---

#### `5.5.5`

- chore(dependencies): update to `Angular 20.1`
- test: update, cleanup icon warnings
- test: workaround `ng test --aot=true` 
  - see: [Karma builder in 20.1 CLI version cannot execute 3rd party templates with structural directives](https://github.com/angular/angular/issues/62573)

---

#### `5.5.3`

- chore: minor cleanups, sync with v5.5.3
- chore(dependencies): update

---

#### `5.5.2`

- chore(dependencies): update
- feat(forms): steppers view
- feat(forms): ratings view
- feat(forms): range-slider view
- feat(forms): password-input view
- feat(base): calendars view
- test(google-maps-data.service): mock Google Maps API, additional tests
- refactor(google-maps-data.service): minor cleanups
- docs: add docs-components banner app component
- docs: add docs-icons banner app component
- refactor(google-maps-data.service): use `@googlemaps/js-api-loader`
- refactor(google-maps): extract google-maps-api service
- refactor(script-injector.service): skip injection when script already loaded

---

#### `5.5.1`

- chore(dependencies): update to `Angular 20`
  - update `@angular/*` to `^20.0.x`
  - update `typescript` to `~5.8.3`
  - move `@angular/localize` to `dependencies` for use at runtime
  - update `@coreui/angular-pro` to `~5.5.2`
  - update `@coreui/angular-chartjs` to `~5.5.2`
  - update `@coreui/icons-angular` to `~5.5.2`
  - update `moduleResolution` to `bundler` in TypeScript configurations
  - migrate application project to the new build system with `application` builder
  - update imports of `DOCUMENT` from `@angular/common` to `@angular/core`
  - update Node.js version list to the supported versions
- fix(dashboard): `TS2307`: Cannot find module `chart.js/dist/types/utils` or its corresponding type declarations. `[plugin angular-compiler]` - tempfix
- refactor: migrate to `inject` function (remove constructor-based dependency injection)
- refactor(toasters): use ComponentRef `setInput()` api
- refactor: migration to signal inputs, host bindings, cleanups
- refactor: migration to signal queries
- fix(mainChart): chart.js - Cannot read properties of undefined _clip (reading 'disabled')  - fixed by stop() current animations
- test: remove deprecated RouterTestingModule, use provideRouter() instead
- refactor: migration to lazy-loaded routes
- refactor: migration to self-closing tags
- fix(email-layout): minimized scrollbar cleanups, missing min-height for .ng-scroll-content
- fix(fullcalendar-angular): dependencies `overrides` tempfix for Angular 20

---

#### `5.4.6`

- chore(dependencies): update
- fix(pages): obsolete css class used in login page example, closes #279 - thanks @bernik1980

---

#### `5.4.5`

- chore(dependencies): update to `Angular 19.2`
- fix(default-layout): missing min-height for .ng-scroll-content

---

#### `5.4.1`

- chore(dependencies): version bump for tilde `~` dependencies for @coreui/* to avoid Sass modules mismatch
- refactor(toasters): signal inputs, cleanup

---

- **refactor(styles): migrate to Sass modules, cleanup**
- refactor(default-layout): scrollbar cleanups
- chore(dependencies): update
- refactor(carousels): toggle interval example
- refactor(form-control): cleanup readonly / plaintext example
- fix(icon-subset): typo in cilContrast
- refactor(dropdowns): disabled cDropdownItem example
- fix(docs-example): set routerLink="" for Preview nav-item

---

- chore(dependencies): update
- refactor(carousels): cleanup, add config
- refactor(app.config): use provideAnimationAsync
- chore(modals): remove @.disabled animations

---

- chore(dependencies): update to `Angular 19.1`
- fix(toast): narrow type for cToastClose

---

#### `5.3.4`

- chore(dependencies): update
- chore(dependencies): security patch for `path-to-regexp` ReDoS in 0.1.x
- fix(toast.component): remove constructor-based dependency injection
- chore(workflows): update node-version to 22.x
- chore(workflows): update with npm ci
- test(google-maps-data.service): add missing import for GoogleMapsModule

---

#### `5.3.0`
 
- chore(dependencies): update to Angular 19
- refactor: directives, components and pipes are now standalone by default
- fix(dashboard-charts-data): brandInfoBg rgb is not a valid hex color
- chore(build): silence sass import deprecation warnings
- fix(toasters): remove position from props for AppToastComponent
- test(date-*-picker): No provider for DropdownService, Deprecated RouterTestingModule use provideRouter() instead
- chore(workflows): update with npm ci
- refactor(google-maps): use MapAdvancedMarker and MapMarkerClusterer, drop deprecated MapMarker and DeprecatedMarkerClusterer
- chore(dependencies): overrides for fullcalendar/angular

---

#### `5.2.22`

- chore(dependencies): update to `Angular 18.2.9`
- fix(widgets-brand): use capBg instead of color
- fix(toasters): toast.index is a signal

---

#### `5.2.16`

- chore(dependencies): update
  - `Angular` to `^18.2.1`
  - `typescript` to `~5.5.4`
  - `tslib`: to `^2.7.0`
  - `zone.js` to `~0.14.10`
  - `@coreui/coreui-pro` to `~5.4.0`
  - `@coreui/angular-chartjs` to `~5.2.16`,
  - `@coreui/angular-pro` to `~5.2.16`,
  - `@coreui/icons-angular` to `~5.2.16`,
  - `@fullcalendar/angular` to `^6.1.15`
  - `@googlemaps/js-api-loader` to `^1.16.8`
  - `chart.js` to `^4.4.4`
  - `jasmine-core` to `^5.2.0`
  - `karma` to `^6.4.4`,
  - `tslib` to `^2.7.0`
  - `micromatch` to `4.0.8`
    - see vulnerability [Regular Expression Denial of Service (ReDoS) in micromatch](https://github.com/advisories/GHSA-952p-6rrq-rcjv)
- refactor: move ColorModeService setup from default-header to app component
- chore(karma.conf): add custom chrome launcher with `--disable-search-engine-choice-screen` flag

---

#### `5.2.5`

- chore(dependencies): update to `Angular 18.1`
- refactor(aside): update tabs to the latest api
- refactor(cards): card navigation update to the latest `tabs` api

---

#### `5.2.3`

- refactor(google-maps): refactor for `@googlemaps/js-api-loader`, extract data and resize observer services, major cleanup and rewrite
- refactor(placeholder): add an animation to placeholder image
- test(apps-email): minor cleanups
- fix(widgets): c-progress white with inverse()
- chore(dependencies): update

---

#### `5.2.0`

CoreUI Pro v5.2 for Angular 18

- chore(dependencies): update to `Angular 18`
- refactor(tabs): update to the latest api
- refactor: minor cleanups

---

#### `5.0.4`

- chore(dependencies): update

---

#### `5.0.3`

- chore(dependencies): update
- fix: add missing `aria-label` attributes etc
- refactor(tabs): add `role="tablist"`, minor cleanups

---

#### `5.0.2`

- chore(dependencies): update
- refactor(default-header): color modes dropdown

---

#### `5.0.0`

CoreUI Pro v5 for Angular 17

- chore(dependencies): update to `Angular 17.3`
- refactor: update to CoreUI v5 (styles, structure, api)
- refactor: standalone components app
- refactor: routes config
- refactor: update to chart.js v4
- refactor: project structure (containers->layout)
- refactor: use control flow
- refactor(progress): update to v5 component structure
- refactor(dashboard): main chart data - typings and theme switching fix
- fix(dashboard): missing custom tooltips on first render, refactor main chart scales

---
