import { NgStyle, NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  AvatarComponent,
  BadgeComponent,
  ButtonDirective,
  ColorModeService,
  ContainerComponent,
  DropdownComponent,
  DropdownDividerDirective,
  DropdownHeaderDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  HeaderComponent,
  HeaderNavComponent,
  HeaderTogglerDirective,
  ProgressComponent,
  SidebarToggleDirective,
} from '@coreui/angular-pro';

import { IconDirective } from '@coreui/icons-angular';
import { MyProvider } from '@shared-services/provider';
import { AuthService } from '@shared-services/auth.service';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  styleUrl: './default-header.component.scss',
  imports: [
    ContainerComponent,
    HeaderTogglerDirective,
    SidebarToggleDirective,
    IconDirective,
    HeaderNavComponent,
    RouterLink,
    NgTemplateOutlet,
    DropdownComponent,
    DropdownToggleDirective,
    AvatarComponent,
    DropdownMenuDirective,
    DropdownHeaderDirective,
    DropdownItemDirective,
    BadgeComponent,
    ProgressComponent,
    ButtonDirective,
    NgStyle,
  ],
})
export class DefaultHeaderComponent extends HeaderComponent {
  readonly provider = inject(MyProvider);
  private readonly auth = inject(AuthService);
  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;

  readonly colorModes = [
    { name: 'light', text: 'Light', icon: 'cilSun' },
    { name: 'dark', text: 'Dark', icon: 'cilMoon' },
    { name: 'auto', text: 'Auto', icon: 'cilContrast' },
  ];

  readonly icons = computed(() => {
    const currentMode = this.colorMode();
    return (
      this.colorModes.find((mode) => mode.name === currentMode)?.icon ??
      'cilSun'
    );
  });

  constructor() {
    super();
  }

  sidebarId = input('sidebar1');

  branchName = 'All Branches';
  // unitName = 'Factory Unit 1';
  // finYear = '2026-27';

  get companyName(): string {
    return 'Canara Bank Api Integration System'; // Replace with actual logic to get the company name
  }

  get userName(): string {
    const user = this.provider.companyInfo?.user as any;
    return user?.username ?? user?.userName ?? user?.name ?? 'User';
  }

  get userRoleName(): string {
    const role = Number(this.provider.companyInfo?.user?.role);
    if (role === 1) return 'Administrator';
    if (role === 2) return 'Checker';
    if (role === 3) return 'Maker';
    return 'User';
  }

  logout(): void {
    this.auth.logout();
  }

  public newMessages = [
    {
      id: 0,
      from: 'Jessica Williams',
      avatar: '7.jpg',
      status: 'success',
      title: 'Urgent: System Maintenance Tonight',
      time: 'Just now',
      link: 'apps/email/inbox/message',
      message:
        "Attention team, we'll be conducting critical system maintenance tonight from 10 PM to 2 AM. Plan accordingly...",
    },
    {
      id: 1,
      from: 'Richard Johnson',
      avatar: '6.jpg',
      status: 'warning',
      title: 'Project Update: Milestone Achieved',
      time: '5 minutes ago',
      link: 'apps/email/inbox/message',
      message:
        "Kudos on hitting sales targets last quarter! Let's keep the momentum. New goals, new victories ahead...",
    },
    {
      id: 2,
      from: 'Angela Rodriguez',
      avatar: '5.jpg',
      status: 'danger',
      title: 'Social Media Campaign Launch',
      time: '1:52 PM',
      link: 'apps/email/inbox/message',
      message:
        'Exciting news! Our new social media campaign goes live tomorrow. Brace yourselves for engagement...',
    },
    {
      id: 3,
      from: 'Jane Lewis',
      avatar: '4.jpg',
      status: 'info',
      title: 'Inventory Checkpoint',
      time: '4:03 AM',
      link: 'apps/email/inbox/message',
      message:
        "Team, it's time for our monthly inventory check. Accurate counts ensure smooth operations. Let's nail it...",
    },
    {
      id: 4,
      from: 'Ryan Miller',
      avatar: '3.jpg',
      status: 'info',
      title: 'Customer Feedback Results',
      time: '3 days ago',
      link: 'apps/email/inbox/message',
      message:
        "Our latest customer feedback is in. Let's analyze and discuss improvements for an even better service...",
    },
  ];

  public newNotifications = [
    {
      id: 0,
      title: 'New user registered',
      icon: 'cilUserFollow',
      color: 'success',
    },
    { id: 1, title: 'User deleted', icon: 'cilUserUnfollow', color: 'danger' },
    {
      id: 2,
      title: 'Sales report is ready',
      icon: 'cilChartPie',
      color: 'info',
    },
    { id: 3, title: 'New client', icon: 'cilBasket', color: 'primary' },
    {
      id: 4,
      title: 'Server overloaded',
      icon: 'cilSpeedometer',
      color: 'warning',
    },
  ];

  public newStatus = [
    {
      id: 0,
      title: 'CPU Usage',
      value: 25,
      color: 'info',
      details: '348 Processes. 1/4 Cores.',
    },
    {
      id: 1,
      title: 'Memory Usage',
      value: 70,
      color: 'warning',
      details: '11444GB/16384MB',
    },
    {
      id: 2,
      title: 'SSD 1 Usage',
      value: 90,
      color: 'danger',
      details: '243GB/256GB',
    },
  ];

  public newTasks = [
    { id: 0, title: 'Upgrade NPM', value: 0, color: 'info' },
    { id: 1, title: 'ReactJS Version', value: 25, color: 'danger' },
    { id: 2, title: 'VueJS Version', value: 50, color: 'warning' },
    { id: 3, title: 'Add new layouts', value: 75, color: 'info' },
    { id: 4, title: 'Angular Version', value: 100, color: 'success' },
  ];
  changeCompany() {
    // open modal / navigate / dropdown
    console.log('Change company clicked');
  }
}
