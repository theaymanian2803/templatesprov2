import { describe, it, expect } from 'vitest'
import en from '@/i18n/locales/en'
import fr from '@/i18n/locales/fr'
import ar from '@/i18n/locales/ar'
import enTemplates from '@/i18n/locales/en.templates'
import frTemplates from '@/i18n/locales/fr.templates'
import arTemplates from '@/i18n/locales/ar.templates'
import enPreview from '@/i18n/locales/en.preview'
import frPreview from '@/i18n/locales/fr.preview'
import arPreview from '@/i18n/locales/ar.preview'
import enCheckout from '@/i18n/locales/en.checkout'
import frCheckout from '@/i18n/locales/fr.checkout'
import arCheckout from '@/i18n/locales/ar.checkout'
import enPages from '@/i18n/locales/en.pages'
import frPages from '@/i18n/locales/fr.pages'
import arPages from '@/i18n/locales/ar.pages'
import enComponents from '@/i18n/locales/en.components'
import frComponents from '@/i18n/locales/fr.components'
import arComponents from '@/i18n/locales/ar.components'

type Dict = Record<string, unknown>

const flatten = (obj: Dict, prefix = ''): string[] =>
  Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return value && typeof value === 'object' && !Array.isArray(value)
      ? flatten(value as Dict, path)
      : [path]
  })

const merge = (...parts: Dict[]): Dict => Object.assign({}, ...parts)

const enAll = merge(en, enTemplates, enPreview, enCheckout, enPages, enComponents)
const frAll = merge(fr, frTemplates, frPreview, frCheckout, frPages, frComponents)
const arAll = merge(ar, arTemplates, arPreview, arCheckout, arPages, arComponents)

const enKeys = flatten(enAll).sort()
const frKeys = flatten(frAll).sort()
const arKeys = flatten(arAll).sort()

describe('i18n key parity', () => {
  it('fr defines exactly the same keys as en', () => {
    expect(frKeys).toEqual(enKeys)
  })

  it('ar defines every key that en defines', () => {
    const arSet = new Set(arKeys)
    const missing = enKeys.filter((k) => !arSet.has(k))
    expect(missing).toEqual([])
  })

  it('ar extra keys are only plural category variants', () => {
    const enSet = new Set(enKeys)
    const extras = arKeys.filter((k) => !enSet.has(k))
    for (const key of extras) {
      expect(key).toMatch(/_(zero|one|two|few|many|other)$/)
    }
  })
})
