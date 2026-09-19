import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDirectDownloadUrl(url: string): string {
  const clean = url.trim()

  // Google Drive: /file/d/FILE_ID/view...
  const gdriveFileMatch = clean.match(
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
  )
  if (gdriveFileMatch) {
    return `https://drive.google.com/uc?export=download&id=${gdriveFileMatch[1]}`
  }

  // Google Drive: /open?id=FILE_ID
  const gdriveOpenMatch = clean.match(
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/
  )
  if (gdriveOpenMatch) {
    return `https://drive.google.com/uc?export=download&id=${gdriveOpenMatch[1]}`
  }

  // Google Drive: /uc?id=FILE_ID (ensure export=download is present)
  const gdriveUcMatch = clean.match(
    /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/
  )
  if (gdriveUcMatch) {
    if (clean.includes('export=download')) return clean
    return `https://drive.google.com/uc?export=download&id=${gdriveUcMatch[1]}`
  }

  // Dropbox: ensure ?dl=1 for direct download
  if (clean.includes('dropbox.com')) {
    const urlObj = new URL(clean)
    urlObj.searchParams.set('dl', '1')
    return urlObj.toString()
  }

  return clean
}
