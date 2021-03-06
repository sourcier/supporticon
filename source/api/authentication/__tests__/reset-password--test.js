import moxios from 'moxios'
import { resetPassword } from '..'
import { instance, updateClient } from '../../../utils/client'

describe('Authentication | Reset Password', () => {
  describe('Reset EDH User Password', () => {
    beforeEach(() => {
      moxios.install(instance)
    })

    afterEach(() => {
      moxios.uninstall(instance)
    })

    it('sends reset password email using the provided params', done => {
      resetPassword({
        clientId: '12345678abcdefg',
        email: 'test@example.com'
      })

      moxios.wait(() => {
        const request = moxios.requests.mostRecent()
        expect(request.url).to.contain(
          'https://everydayhero.com/api/v2/authentication/reset_password'
        )

        request.respondWith({ status: 204 }).then(response => {
          expect(response.status).to.eql(204)
          done()
        })
      })
    })

    it('throws if no parameters are provided', () => {
      const test = () => resetPassword()
      expect(test).to.throw
    })

    it('throws if no clientId param is provided', () => {
      const test = () =>
        resetPassword({
          email: 'test@gmail.com'
        })

      expect(test).to.throw
    })
  })

  describe('Reset JG User Password', () => {
    beforeEach(() => {
      updateClient({
        baseURL: 'https://api.justgiving.com',
        headers: { 'x-api-key': 'abcd1234' }
      })
      moxios.install(instance)
    })

    afterEach(() => {
      updateClient({ baseURL: 'https://everydayhero.com' })
      moxios.uninstall(instance)
    })

    it('sends reset password email using the provided params', done => {
      resetPassword({ email: 'test@example.com' })

      moxios.wait(() => {
        const request = moxios.requests.mostRecent()
        expect(request.url).to.contain('https://api.justgiving.com/v1/account')
        expect(request.url).to.contain('test@example.com')
        expect(request.url).to.contain('requestpasswordreminder')

        request.respondWith({ status: 200 }).then(response => {
          expect(response.status).to.eql(200)
          done()
        })
      })
    })

    it('throws if no parameters are provided', () => {
      const test = () => resetPassword()
      expect(test).to.throw
    })
  })
})
