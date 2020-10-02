import lodashGet from 'lodash/get'
import orderBy from 'lodash/orderBy'
import { get, servicesAPI } from '../../../utils/client'
import { apiImageUrl, baseUrl, imageUrl } from '../../../utils/justgiving'
import {
  getUID,
  required,
  dataSource,
  isEmpty,
  paramsSerializer,
  splitOnDelimiter
} from '../../../utils/params'
import { currencySymbol, currencyCode } from '../../../utils/currencies'

/**
 * @function fetches fundraising pages ranked by funds raised
 */
export const fetchLeaderboard = (params = required()) => {
  if (!isEmpty(params.campaign) && params.allPages) {
    return recursivelyFetchJGLeaderboard(
      getUID(params.campaign),
      params.q,
      params.limit
    )
  }

  switch (dataSource(params)) {
    case 'event':
      if (params.type === 'team') {
        return Promise.reject(
          new Error('Team leaderboards by event are not supported')
        )
      }

      return get(
        '/v1/events/leaderboard',
        {
          eventid: Array.isArray(params.event)
            ? params.event.map(getUID)
            : getUID(params.event),
          currency: currencyCode(params.country),
          maxResults: params.limit
        },
        {},
        { paramsSerializer }
      ).then(response =>
        response.pages.map(page => ({
          ...page,
          raisedAmount: page.amount,
          eventName: response.eventName,
          currencyCode: response.currency,
          currencySymbol: currencySymbol(response.currency)
        }))
      )
    default:
      const isTeam = params.type === 'team'
      const maxPerRequest = 20
      const { results = [], ...otherParams } = params

      return get(
        'donationsleaderboards/v1/leaderboard',
        {
          ...otherParams,
          currencyCode: currencyCode(params.country)
        },
        {
          mappings: {
            campaign: 'campaignGuids',
            charity: 'charityIds',
            excludePageIds: 'excludePageGuids',
            limit: 'take',
            page: 'offset',
            type: 'groupBy'
          },
          transforms: {
            campaign: splitOnDelimiter,
            charity: splitOnDelimiter,
            excludePageIds: splitOnDelimiter,
            limit: val => Math.min(maxPerRequest, val || 10),
            page: val =>
              String(
                val
                  ? Math.min(maxPerRequest, params.limit || 10) * (val - 1)
                  : 0
              ),
            type: val => (isTeam ? 'TeamGuid' : 'PageGuid')
          }
        },
        { paramsSerializer }
      )
        .then(response => {
          const { currentPage, lastRowOnPage, pageCount } = response.meta
          const updatedResults = [...results, ...response.results]

          if (currentPage >= pageCount || lastRowOnPage >= params.limit) {
            return updatedResults
          }

          return fetchLeaderboard({
            ...params,
            results: updatedResults,
            page: currentPage + 1
          })
        })
        .then(results => filterLeaderboardResults(results, isTeam))
        .then(results => mapLeaderboardResults(results, isTeam))
        .then(results => rankLeaderboardResults(results, isTeam))
  }
}

const rankLeaderboardResults = (results = [], isTeam) => {
  return orderBy(results, ['donationAmount'], ['desc'])
}

const filterLeaderboardResults = (results = [], isTeam) => {
  return results.filter(result => (isTeam ? result.team : result.page))
}

const mapLeaderboardResults = (results = [], isTeam) => {
  return results.map(result => {
    return isTeam
      ? {
        ...result,
        ...result.team,
        currencyCode: lodashGet(
          result.team,
          'fundraisingConfiguration.currencyCode'
        ),
        donationAmount:
            lodashGet(result, 'team.donationSummary.totalAmount') ||
            result.donationAmount,
        eventName: [
          result.team.captain.firstName,
          result.team.captain.lastName
        ].join(' '),
        numberOfSupporters: result.team.numberOfSupporters,
        pageId: result.id,
        pageImages: [result.team.coverImageName],
        pageShortName: result.team.shortName,
        target: lodashGet(
          result.team,
          'fundraisingConfiguration.targetAmount'
        ),
        type: 'team'
      }
      : {
        ...result,
        ...result.page,
        donationAmount:
            lodashGet(result, 'page.raisedAmount') || result.donationAmount,
        eventName: [
          result.page.owner.firstName,
          result.page.owner.lastName
        ].join(' '),
        pageImages: [result.page.photo],
        pageShortName: result.page.shortName,
        numberOfSupporters: result.donationCount,
        type: 'individual'
      }
  })
}

const recursivelyFetchJGLeaderboard = (
  campaign,
  q,
  limit = 10,
  results = [],
  page = 1
) => {
  const options = {
    params: { page, q }
  }

  return servicesAPI
    .get(`/v1/justgiving/campaigns/${campaign}/pages`, options)
    .then(response => response.data)
    .then(data => {
      const { currentPage, totalPages } = data.meta
      const updatedResults = [...results, ...data.results]

      if (currentPage === totalPages || page * 10 >= limit) {
        return updatedResults
      } else {
        return recursivelyFetchJGLeaderboard(
          campaign,
          q,
          limit,
          updatedResults,
          page + 1
        )
      }
    })
}

/**
 * @function a default deserializer for leaderboard pages
 */
export const deserializeLeaderboard = (supporter, index) => {
  const isTeam = supporter.type === 'team'
  const slug = supporter.pageShortName || supporter.shortName
  const owner =
    lodashGet(supporter, 'pageOwner.fullName') ||
    lodashGet(supporter, 'owner.firstName')
      ? [supporter.owner.firstName, supporter.owner.lastName].join(' ')
      : null

  return {
    currency: supporter.currencyCode,
    currencySymbol: supporter.currencySymbol,
    donationUrl: isTeam ? null : `${baseUrl()}/fundraising/${slug}/donate`,
    id: supporter.pageId,
    image:
      supporter.defaultImage ||
      imageUrl(lodashGet(supporter, 'pageImages[0]'), 'Size186x186Crop') ||
      imageUrl(supporter.photo, 'Size186x186Crop') ||
      (isTeam
        ? 'https://assets.blackbaud-sites.com/images/supporticon/user.svg'
        : apiImageUrl(slug, 'Size186x186Crop')),
    name:
      supporter.pageTitle ||
      supporter.name ||
      lodashGet(supporter, 'pageOwner.fullName'),
    offline: parseFloat(
      supporter.totalRaisedOffline || supporter.raisedOfflineAmount || 0
    ),
    owner: owner || supporter.owner,
    position: index + 1,
    raised: parseFloat(
      lodashGet(supporter, 'team.donationSummary.totalAmount') ||
        lodashGet(supporter, 'page.totalAmount') ||
        supporter.donationAmount ||
        supporter.amount ||
        supporter.raisedAmount ||
        supporter.amountRaised ||
        0
    ),
    slug,
    status: lodashGet(supporter, 'page.status'),
    subtitle: owner || supporter.eventName,
    target: supporter.targetAmount || supporter.target,
    totalDonations: supporter.numberOfSupporters || supporter.donationCount,
    url: [baseUrl(), isTeam ? 'team' : 'fundraising', slug].join('/')
  }
}
