import moment from 'moment'
import lodashGet from 'lodash/get'
import { get, post, destroy, servicesAPI } from '../../../utils/client'
import { paramsSerializer, required } from '../../../utils/params'
import { convertToMeters, convertToSeconds } from '../../../utils/units'
import { extractData } from '../../../utils/graphql'
import { encodeBase64String } from '../../../utils/base64'
import jsonDate from '../../../utils/jsonDate'

const getFitnessId = (source, activity) => {
  if (activity.id) return activity.id

  switch (source) {
    case 'fitness':
      return encodeBase64String(
        [
          'Timeline:FUNDRAISING',
          activity.PageGuid,
          'FITNESS:STRAVA',
          activity.ExternalId
        ].join(':')
      )
    case 'manual':
      // legacy activity created via Consumer API
      if (!activity.ExternalId) return null

      return encodeBase64String(
        ['Timeline:FUNDRAISING', activity.PageGuid, activity.ExternalId].join(
          ':'
        )
      )
    default:
      return null
  }
}

const getExternalId = (source, activity) => {
  switch (source) {
    case 'fitness':
      return activity.ExternalId || activity.activityId
    default:
      return null
  }
}

const getMetricValue = metric => {
  switch (typeof metric) {
    case 'object':
      return lodashGet(metric, 'value', 0)
    default:
      return metric
  }
}

export const deserializeFitnessActivity = (activity = required()) => {
  const activityType = (
    activity.activityType ||
    activity.Type ||
    ''
  ).toLowerCase()
  const source = (activity.type || activity.ActivityType || '').toLowerCase()

  return {
    campaign: activity.CampaignGuid,
    charity: activity.CharityId,
    createdAt: activity.createdAt || jsonDate(activity.DateCreated),
    description: activity.Description || activity.message,
    distance: getMetricValue(activity.distance || activity.Value),
    duration: getMetricValue(activity.duration || activity.TimeTaken),
    elevation: getMetricValue(activity.elevation || activity.Elevation),
    externalId: getExternalId(source, activity),
    eventId: activity.EventId,
    id: getFitnessId(source, activity),
    legacyId: activity.Id,
    manual:
      activity.ActivityType === 'Manual' ||
      activity.ActivityType === 'manual' ||
      activity.type === 'MANUAL',
    page: activity.PageGuid,
    polyline: activity.mapPolyline,
    slug: activity.PageShortName,
    source,
    sourceUrl:
      source === 'fitness'
        ? `https://www.strava.com/activities/${activity.ExternalId ||
            activity.activityId}`
        : null,
    teamId: activity.TeamGuid,
    title: activity.Title || activity.title,
    type: activityType
  }
}

export const fetchFitnessActivities = (params = required()) => {
  const query = {
    limit: params.limit || 100,
    offset: params.offset || 0,
    start: params.startDate,
    end: params.endDate
  }

  if (params.page) {
    if (params.useLegacy) {
      return get(`/v1/fitness/fundraising/${params.page}`, query).then(
        response => response.activities
      )
    }

    const { page, after, allActivities, results = [] } = params

    const graphQLQuery = `
      {
        page(type: FUNDRAISING, slug: "${page}") {
          timeline(first: 20${after ? `, after: "${after}"` : ' '}) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              id
              legacyId
              message
              type
              createdAt
              fitnessActivity {
                title
                activityId
                activityType
                mapPolyline
                distance { value unit }
                elevation { value unit }
                duration { value unit }
              }
            }
          }
        }
      }
    `

    return servicesAPI
      .post('/v1/justgiving/graphql', { query: graphQLQuery })
      .then(response => response.data)
      .then(result => {
        const data = lodashGet(result, 'data.page.timeline', {})
        const { pageInfo = {}, nodes = [] } = data
        const updatedResults = [...results, ...nodes]

        if (allActivities && pageInfo.hasNextPage) {
          return fetchFitnessActivities({
            page,
            after: pageInfo.endCursor,
            results: updatedResults,
            allActivities: true
          })
        } else {
          return updatedResults
            .filter(activity => activity.fitnessActivity)
            .map(activity => ({
              ...activity,
              ...lodashGet(activity, 'fitnessActivity', {})
            }))
        }
      })
  }

  if (params.team) {
    return get(`/v1/fitness/teams/${params.team}`, query).then(
      response => response.activities
    )
  }

  if (params.campaign) {
    return get(
      '/v1/fitness/campaign',
      { ...query, campaignGuid: params.campaign },
      {},
      { paramsSerializer }
    ).then(response => response.activities)
  }

  return required()
}

const activityType = type => {
  switch (type) {
    case 'bike':
    case 'ride':
      return 'RIDE'
    case 'swim':
      return 'SWIM'
    case 'run':
      return 'RUN'
    case 'hike':
      return 'HIKE'
    default:
      return 'WALK'
  }
}

export const createFitnessActivity = ({
  caption,
  description,
  distance = 0,
  duration = 0,
  durationUnit,
  elevation = 0,
  elevationUnit,
  pageId,
  pageSlug,
  startedAt,
  title,
  type = 'walk',
  token = required(),
  unit,
  userId,
  useLegacy
}) => {
  const headers = { Authorization: `Bearer ${token}` }

  if (!useLegacy) {
    if (!pageId || !userId) {
      return required()
    }

    const createdDate = startedAt
      ? `createdDate: "${moment(startedAt).toISOString()}"`
      : ''

    const message = description ? `message: "${description}"` : ''

    const query = `
      mutation {
        createTimelineEntry (
          input: {
            type: FUNDRAISING
            pageId: "${pageId}"
            creatorGuid: "${userId}"
            ${createdDate}
            ${message}
            fitness: {
              title: "${title || caption || ''}",
              activityType: ${activityType(type)}
              distance: ${convertToMeters(distance, unit)}
              duration: ${convertToSeconds(duration, durationUnit)}
              elevation: ${convertToMeters(elevation, elevationUnit || unit)}
            }
          }
        ) {
          id
          message
          createdAt
          fitnessActivity {
            title
            activityType
            distance { value unit }
            elevation { value unit }
            duration { value unit }
          }
        }
      }
    `

    return servicesAPI
      .post('/v1/justgiving/graphql', { query }, { headers })
      .then(response => extractData(response))
      .then(result => ({
        ...lodashGet(result, 'data.createTimelineEntry', {}),
        ...lodashGet(result, 'data.createTimelineEntry.fitnessActivity', {})
      }))
  }

  if (!pageSlug) {
    return required()
  }

  const params = {
    dateCreated: moment(startedAt).isBefore(moment(), 'day')
      ? moment(startedAt).format('DD/MM/YYYY')
      : null,
    description: description,
    distance: convertToMeters(distance, unit),
    duration: convertToSeconds(duration, durationUnit),
    elevation: convertToMeters(elevation, elevationUnit || unit),
    shortName: pageSlug,
    title: title || caption,
    type
  }

  return post('/v1/fitness', params, { headers })
}

export const updateFitnessActivity = (id = required(), params = required()) =>
  Promise.reject(new Error('This method is not supported by JustGiving'))

export const deleteFitnessActivity = ({
  id = required(),
  page,
  token = required(),
  useLegacy
}) => {
  if (useLegacy) {
    return deleteLegacyFitnessActivity({ id, page, token })
  }

  const query = `
    mutation {
      deleteTimelineEntry (
        input: {
          id: "${id}"
        }
      )
    }
  `

  const headers = { Authorization: `Bearer ${token}` }

  return servicesAPI
    .post('/v1/justgiving/graphql', { query }, { headers })
    .then(response => extractData(response))
    .then(result => lodashGet(result, 'data.deleteTimelineEntry'))
}

export const deleteLegacyFitnessActivity = ({
  id = required(),
  page = required(),
  token = required()
}) =>
  destroy(`/v1/fitness/fundraising/${page}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
