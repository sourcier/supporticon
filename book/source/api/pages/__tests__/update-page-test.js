import moxios from 'moxios'
import { instance, updateClient } from '../../../utils/client'
import { updatePage } from '..'

describe ('Page | Update Page', () => {
  beforeEach (() => {
    moxios.install(instance)
  })

  afterEach (() => {
    moxios.uninstall(instance)
  })

  describe ('Create EDH Page', () => {
    it ('throws if no token is passed', () => {
      const test = () => updatePage(123, {
        bogus: 'data'
      })
      expect(test).to.throw
    })

    it ('hits the supporter api with the correct url and data', (done) => {
      updatePage(123, {
        token: '012345abcdef',
        campaignId: '1234',
        name: 'Super Supporter',
        birthday: '1970-01-02'
      })

      moxios.wait(() => {
        const request = moxios.requests.mostRecent()
        expect(request.url).to.contain('https://everydayhero.com/api/v2/pages/123?access_token=012345abcdef')
        done()
      })
    })

    it ('returns the expected params', (done) => {
      const response = {
        campaignId: '1234',
        name: 'Super Supporter',
        birthday: '1970-01-02'
      }

      updatePage(123, {
        token: '012345abcdef',
        campaignId: '1234',
        name: 'Super Supporter',
        birthday: '1970-01-02'
      }).then((page) => {
        expect(page).to.equal(response)
        done()
      })

      moxios.wait(() => {
        const request = moxios.requests.mostRecent()
        request.respondWith({ response: response })
      })
    })
  })

  describe ('Create JG Page', () => {
    beforeEach (() => {
      updateClient({ baseURL: 'https://api.justgiving.com' })
    })

    afterEach (() => {
      updateClient({ baseURL: 'https://everydayhero.com' })
    })

    it ('throws method not supported error', (done) => {
      updatePage(123, { foo: 'bar' }).catch((err) => {
        expect(err).to.eql('This method is not supported for JustGiving')
        done()
      })
    })
  })
})