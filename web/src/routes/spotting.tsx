import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/spotting')({
  component: SpottingLayout,
});

function SpottingLayout() {
  return <Outlet />;
}
