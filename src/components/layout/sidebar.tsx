@@ -8,6 +8,7 @@ import {
   CalendarDaysIcon,
   ChartBarIcon,
   Cog6ToothIcon,
+  ShieldCheckIcon,
  BoltIcon,
 } from '@heroicons/react/24/outline';
 import { ROUTES } from '@/constants';
 import { cn } from '@/lib/utils';
@@ -42,6 +43,10 @@ const navigation = [
     name: 'Analytics',
     href: ROUTES.ANALYTICS,
     icon: ChartBarIcon,
+  },
+  {
+    name: 'Security',
+    href: ROUTES.MFA_MANAGE,
+    icon: ShieldCheckIcon,
   },
  {
    name: 'Workflows',
    href: ROUTES.WORKFLOWS,
    icon: BoltIcon,
  },
   {
     name: 'Settings',