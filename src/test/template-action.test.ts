import { describe, it, expect } from 'vitest'
import { resolveTemplateAction } from '@/lib/templateAction'

describe('resolveTemplateAction', () => {
  it('always routes free templates through the free flow, even with access', () => {
    expect(resolveTemplateAction(0, true)).toBe('free')
    expect(resolveTemplateAction(0, false)).toBe('free')
  })

  it('treats a non-positive price as free', () => {
    expect(resolveTemplateAction(-5, true)).toBe('free')
    expect(resolveTemplateAction('0', false)).toBe('free')
  })

  it('offers a direct download for paid templates the visitor already has', () => {
    expect(resolveTemplateAction(59, true)).toBe('download')
    expect(resolveTemplateAction('59', true)).toBe('download')
  })

  it('offers a purchase for paid templates without access', () => {
    expect(resolveTemplateAction(59, false)).toBe('buy')
  })
})
