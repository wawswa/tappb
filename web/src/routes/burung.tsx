import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/burung')({
  component: BurungLayout,
});

function BurungLayout() {
  return <Outlet />;
}
