import {
  get,
  put,
  post,
  jgIdentityClient,
  servicesAPI
} from '../../../utils/client'
import { required } from '../../../utils/params'
import { encodeBase64String } from '../../../utils/base64'

export const resetPassword = ({ email = required() }) =>
  get(`v1/account/${email}/requestpasswordreminder`)

export const validateToken = (token = required()) =>
  jgIdentityClient
    .get(`/connect/accesstokenvalidation?token=${token}`)
    .then(response => ({ ...response.data, valid: true }))
    .catch(({ response }) => ({ ...response.data, valid: false }))

export const signIn = ({ email = required(), password = required() }) => {
  const token = encodeBase64String(`${email}:${password}`)

  return get(
    'v1/account',
    {},
    {},
    {
      headers: {
        Authorization: `Basic ${token}`
      }
    }
  ).then(data => ({
    address: data.address,
    email: data.email,
    name: [data.firstName, data.lastName].join(' '),
    token,
    userId: data.userId
  }))
}

export const signUp = ({
  firstName = required(),
  lastName = required(),
  email = required(),
  password = required(),
  address,
  title,
  cause,
  reference
}) => {
  const payload = {
    acceptTermsAndConditions: true,
    firstName,
    lastName,
    email,
    password,
    title,
    address,
    reference,
    causeId: cause
  }

  const request = address
    ? put('v1/account', payload)
    : post('v1/account/lite', payload)

  return request.then(data => ({
    address,
    country: data.country,
    email,
    firstName,
    lastName,
    name: [firstName, lastName].join(' '),
    token: encodeBase64String(`${email}:${password}`)
  }))
}

export const checkAccountAvailability = email => {
  return get(`/v1/account/${email}`)
    .then(() => true)
    .catch(() => false)
}

export const connectToken = data => {
  return servicesAPI
    .post('/v1/justgiving/oauth/connect', data)
    .then(response => response.data)
    .then(data => ({
      token: data.access_token,
      refreshToken: data.refresh_token
    }))
}
