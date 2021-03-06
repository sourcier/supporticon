import { get } from '../../../utils/client'
import { required } from '../../../utils/params'

export const c = {
  ENDPOINT: 'api/v2/charities',
  SEARCH_ENDPOINT: 'api/v2/search/charities'
}

export const fetchCharities = (params = required()) => {
  const mappings = { campaign: 'campaign_ids' }
  const transforms = { campaign: v => (Array.isArray(v) ? v.join(',') : v) }

  return get(c.ENDPOINT, params, { mappings, transforms }).then(
    response => response.charities
  )
}

export const fetchCharity = (id = required()) => {
  if (typeof id === 'object') {
    const { countryCode = required(), slug = required() } = id

    return get([c.ENDPOINT, countryCode, slug].join('/')).then(
      response => response.charity
    )
  }

  return get(`${c.ENDPOINT}/${id}`).then(response => response.charity)
}

export const searchCharities = (params = required()) =>
  get(c.SEARCH_ENDPOINT, params).then(response => response.charities)

export const deserializeCharity = charity => ({
  active: charity.active,
  campaigns: charity.campaign_uids,
  categories: charity.causes,
  country: charity.country_code,
  description: charity.description,
  donateUrl: charity.donate_url,
  getStartedUrl: charity.get_started_url,
  email: charity.public_email,
  id: charity.uid || charity.id,
  logo: charity.logo_url,
  name: charity.name,
  registrationNumber: charity.registration_number,
  slug: charity.slug,
  url: charity.url,
  uuid: charity.uuid
})
