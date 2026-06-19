/** Caminho público do currículo no site principal */
export const CV_PUBLIC_PATH = '/cv'

export const LINKEDIN_URL = 'https://linkedin.com/in/eduardodamasceno'

export function getCvPublicUrl(path = '/'): string {
  if (path === '/' || path === '') return CV_PUBLIC_PATH
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${CV_PUBLIC_PATH}${suffix}`
}
