import slugifyLib from 'slugify'

export const slugify = (text) => {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true
  })
}
