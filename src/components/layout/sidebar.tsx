import {
  UserIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  BoltIcon,
  BellIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Event Types',
    href: ROUTES.EVENT_TYPES,
    icon: CalendarDaysIcon,
  },
  {
    name: 'Bookings',
    href: ROUTES.BOOKINGS,
    icon: CalendarDaysIcon,
  },
  {
    name: 'Availability',
    href: ROUTES.AVAILABILITY,
    icon: ClockIcon,
  },
  {
    name: 'Workflows',
    href: ROUTES.WORKFLOWS,
    icon: BoltIcon,
  },
  {
    name: 'Notifications',
    href: ROUTES.NOTIFICATIONS,
    icon: BellIcon,
  },
  {
    name: 'Integrations',
    href: ROUTES.INTEGRATIONS,
    icon: LinkIcon,
  },
  {
    name: 'Contacts',
    href: ROUTES.CONTACTS,
    icon: UsersIcon,
  },
  {
    name: 'Analytics',
    href: ROUTES.ANALYTICS,
    icon: ChartBarIcon,
  },
  {
    name: 'Team',
    href: ROUTES.TEAM,
    icon: UsersIcon,
  },
  {
    name: 'Security',
    href: ROUTES.MFA_MANAGE,
    icon: ShieldCheckIcon,
  },
  {
    name: 'Profile',
    href: ROUTES.PROFILE,
    icon: UserIcon,
  },
  {
    name: 'Settings',
    href: ROUTES.SETTINGS,
    icon: Cog6ToothIcon,
  },
];