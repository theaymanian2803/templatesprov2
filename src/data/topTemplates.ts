/*
  Static hero showcase manifest — one-time snapshot of the top-selling templates.
  Kept static so the hero paints instantly with zero network request.
  Refresh manually whenever the catalog's top sellers change.
*/

export interface TopTemplate {
  id: string
  title: string
  image_url: string
  price: number
  category: string
  rating: number
}

export const topTemplates: TopTemplate[] = [
  {
    id: '86531b95-5ce8-4780-93c0-a8b589d79342',
    title: 'PREMIUM SPA TEMPLATE',
    image_url:
      'https://pub-3fe2b2a234a04507951dc3d5646b7a33.r2.dev/mawyryd57bs-1783993497220.png',
    price: 79,
    category: 'E-commerce',
    rating: 0,
  },
  {
    id: '2dca881e-1684-4f0f-9df5-ce3d608ecbba',
    title: 'Puppy And Cat Food',
    image_url:
      'https://pub-3fe2b2a234a04507951dc3d5646b7a33.r2.dev/5eykw80n3p-1783359427362.png',
    price: 29,
    category: 'E-commerce',
    rating: 0,
  },
  {
    id: 'bd738190-42ff-4f1e-b3e9-f575971ef600',
    title: 'Rent car sass',
    image_url:
      'https://pub-3fe2b2a234a04507951dc3d5646b7a33.r2.dev/oentflmh0yh-1777597631852.png',
    price: 49,
    category: 'SaaS',
    rating: 0,
  },
  {
    id: '6f896d44-cd99-4228-9a5c-2b19485f8ba7',
    title: 'Home Decor E-Commerce Store',
    image_url:
      'https://pub-3fe2b2a234a04507951dc3d5646b7a33.r2.dev/c0pzjpmj9we-1783616029648.png',
    price: 48.99,
    category: 'E-commerce',
    rating: 0,
  },
]