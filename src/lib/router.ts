import { useCallback } from 'react'
import {
  Link,
  Navigate,
  useLocation as useTanstackLocation,
  useNavigate as useTanstackNavigate,
  useParams as useTanstackParams,
  useSearch as useTanstackSearch,
} from '@tanstack/react-router'

export { Link, Navigate }

type NavigateOpts = { replace?: boolean; state?: unknown }

export function useNavigate() {
  const navigate = useTanstackNavigate()
  return useCallback(
    (to: string, opts?: NavigateOpts) => {
      return navigate({ to, replace: opts?.replace, state: opts?.state })
    },
    [navigate],
  )
}

export function useLocation() {
  return useTanstackLocation()
}

export function useParams<T extends Record<string, string> = Record<string, string>>() {
  return useTanstackParams({ strict: false }) as T
}

export function useSearchParams() {
  const navigate = useTanstackNavigate()
  const search = useTanstackSearch({ strict: false }) as Record<string, unknown>

  const searchParams = new URLSearchParams()
  for (const [k, v] of Object.entries(search ?? {})) {
    if (v != null) searchParams.set(k, String(v))
  }

  const setSearchParams = useCallback(
    (params: Record<string, string> | URLSearchParams, opts?: NavigateOpts) => {
      const obj: Record<string, string> = {}
      if (params instanceof URLSearchParams) {
        params.forEach((v, k) => (obj[k] = v))
      } else {
        Object.assign(obj, params)
      }
      return navigate({ to: '.', search: obj, replace: opts?.replace })
    },
    [navigate],
  )

  return [searchParams, setSearchParams] as const
}
