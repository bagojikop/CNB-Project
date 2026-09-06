import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MyProvider } from '@shared-services/provider';

@Component({
  selector: 'app-profile',
  imports: [RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private readonly provider = inject(MyProvider);
  readonly user = this.provider.companyInfo?.user ?? {};
  readonly company = this.provider.companyInfo?.company ?? {};

  get displayName(): string { return this.user.username ?? this.user.userName ?? this.user.name ?? 'Admin User'; }
  get initials(): string { return this.displayName.split(/\s+/).slice(0, 2).map((part: string) => part[0]).join('').toUpperCase(); }
  get roleName(): string { return Number(this.user.role) === 1 ? 'Administrator' : Number(this.user.role) === 2 ? 'Checker' : Number(this.user.role) === 3 ? 'Maker' : 'User'; }
}
