import { get, post, put } from '../../../utils/client'
import { required } from '../../../utils/params'

/**
* @function deserializer for supporter pages
*/
export const deserializePage = (page) => ({
  active: page.active,
  campaign: page.campaign || page.campaign_name,
  campaignDate: page.campaign_date,
  charity: page.charity || page.charity_name,
  coordinates: page.coordinate,
  donatationUrl: page.donation_url,
  expired: page.expired,
  groups: page.page_groups,
  id: page.id,
  image: page.image.medium_image_url,
  name: page.name,
  raised: page.amount.cents,
  story: page.story,
  target: page.target_cents,
  teamPageId: page.team_page_id,
  url: page.url,
  uuid: page.uuid
})

/**
* @function fetches pages from the supporter api
*/
export const fetchPages = (params = required()) => {
  return get('api/v2/search/pages', params)
    .then((response) => response.pages)
}

/**
* @function fetches a single page from the supporter api
*/
export const fetchPage = (id = required()) => {
  return get(`api/v2/pages/${id}`)
    .then((response) => response.page)
}

/**
 * @function create page using the supporter api
 */
export const createPage = ({
  token = required(),
  campaignId = required(),
  birthday = required(),
  name,
  target,
  nickname,
  slug,
  image,
  charityId,
  expiresAt,
  fitnessGoal,
  campaignDate,
  groupValues,
  skipNotification,
  inviteToken
}) => {
  return post(`/api/v2/pages?access_token=${token}`, {
    campaign_id: campaignId,
    birthday,
    name,
    target,
    nickname,
    slug,
    image,
    charity_id: charityId,
    expires_at: expiresAt,
    fitness_goal: fitnessGoal,
    campaign_date: campaignDate,
    group_values: groupValues,
    skip_notification: skipNotification,
    token: inviteToken
  })
}

/**
 * @function update page using the supporter api
 */
export const updatePage = (pageId, {
  token = required(),
  name,
  target,
  slug,
  story,
  image,
  expiresAt,
  fitnessGoal,
  campaignDate,
  groupValues
}) => {
  return put(`/api/v2/pages/${pageId}?access_token=${token}`, {
    name,
    target,
    slug,
    story,
    image,
    expires_at: expiresAt,
    fitness_goal: fitnessGoal,
    campaign_date: campaignDate,
    group_values: groupValues
  })
}