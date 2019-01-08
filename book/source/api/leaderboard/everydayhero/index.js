import last from 'lodash/last'
import { get } from '../../../utils/client'
import { required } from '../../../utils/params'

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
    return deserializePage(result.page, index)
  } else if (result.team) {
    return deserializePage(result.team, index)
  } else if (result.group) {
    return deserializeGroup(result, index)
  }
}

const deserializePage = (item, index) => ({
  currency: item.amount.currency.iso_code,
  currencySymbol: item.amount.currency.symbol,
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
  url: item.url
})

const deserializeGroup = (item, index) => ({
  count: item.count,
  id: item.group.id,
  name: item.group.value,
  position: index + 1,
  raised: item.amount_cents / 100
})