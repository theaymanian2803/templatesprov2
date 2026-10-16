/** Tailwind classes for a section title's alignment + case transform. */
export const titleAlignClass = (align?: unknown) =>
  align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'

export const titleTransformClass = (transform?: unknown) =>
  transform === 'capitalize' ? 'capitalize' : transform === 'uppercase' ? 'uppercase' : 'normal-case'

export const sectionTitleClasses = (config?: Record<string, unknown>) =>
  `${titleAlignClass(config?.title_align)} ${titleTransformClass(config?.title_transform)}`
