import last from 'lodash/last'
import { get } from '../../../utils/client'
import { required } from '../../../utils/params'
import URL from 'url-parse'

/**
 * @function fetches supporter pages ranked by funds raised
 */
export const fetchLeaderboard = (params = required()) => {
  const transforms = {
    type: val =>
      val === 'team' ? 'teams' : val === 'group' ? 'groups' : 'individuals'
  }

  const mappings = {
    endDate: 'end_at',
    excludePageIds: 'exclude_page_ids',
    groupID: 'group_id',
    maxAmount: 'max_amount_cents',
    minAmount: 'min_amount_cents'
  }

  return get('api/v2/search/pages_totals', params, {
    mappings,
    transforms
  }).then(response => response.results)
}

/**
 * @function a default deserializer for leaderboard pages
 */
export const deserializeLeaderboard = (result, index) => {
  if (result.page) {
    return deserializePage(result.page, index, result)
  } else if (result.team) {
    return deserializePage(result.team, index, result)
  } else if (result.group) {
    return deserializeGroup(result, index)
  }
}

const deserializePage = (item, index, baseItem) => ({
  charityImage: item.charity_image && item.charity_image.large_image_url,
  currency: item.amount.currency.iso_code,
  currencySymbol: item.amount.currency.symbol,
  donationCount: baseItem.count,
  donationUrl: donationUrl(item.url),
  groups: item.group_values,
  id: item.id,
  image: item.image.large_image_url,
  name: item.name,
  offline: (item.offline_amount_cents || 0) / 100,
  position: index + 1,
  raised: item.amount.cents / 100,
  slug: item.url && last(item.url.split('/')),
  subtitle: item.charity_name,
  target: item.target_cents / 100,
  totalDonations: baseItem.count,
  url: item.url
})

const deserializeGroup = (item, index) => ({
  count: item.count,
  id: item.group.id,
  name: item.group.value,
  position: index + 1,
  raised: item.amount_cents / 100
})

const donationUrl = url => {
  const parsedUrl = new URL(url)
  const [campaignSlug, domain] = parsedUrl.hostname.split('.')
  const [countryCode, pageSlug] = parsedUrl.pathname.substring(1).split('/')

  switch (countryCode) {
    case 'ie':
      return undefined
    case 'us':
      return `https://donate.${domain}.com/${countryCode}/${campaignSlug}/${pageSlug}`
    default:
      return `https://heroix-${countryCode}.${domain}.com/event/${campaignSlug}/hero_page/${pageSlug}/donate`
  }
}
