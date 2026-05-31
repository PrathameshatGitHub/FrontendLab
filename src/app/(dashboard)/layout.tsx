import * as React from 'react';
import { DashboardLayout } from '@/components/shared/dashboard-layout';

export default function DashboardGroupRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
