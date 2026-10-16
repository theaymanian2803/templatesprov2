import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import ErrorComponent from './components/ErrorComponent'

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultErrorComponent: ErrorComponent,
  } as any)
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
