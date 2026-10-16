export type TemplateAction = 'free' | 'download' | 'buy'

export const resolveTemplateAction = (
  price: number | string,
  hasAccess: boolean,
): TemplateAction => {
  if (Number(price) <= 0) return 'free'
  return hasAccess ? 'download' : 'buy'
}
