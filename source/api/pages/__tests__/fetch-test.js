import moxios from 'moxios'
import { fetchPages } from '..'
import { instance, updateClient } from '../../../utils/client'

describe ('Fetch Pages', () => {
  beforeEach (() => {
    moxios.install(instance)
  })

  afterEach (() => {
    moxios.uninstall(instance)
  })

  describe ('Fetch EDH Pages', () => {
    it ('uses the correct url to fetch pages', (done) => {
      fetchPages({ campaign_id: 'au-6839' })
      moxios.wait(() => {
        const request = moxios.requests.mostRecent()
        expect(request.url).to.contain('https://everydayhero.com/api/v2/search/pages')
        expect(request.url).to.contain('campaign_id=au-6839')
        done()
      })
    })

    it ('throws if no params are passed in', () => {
      const test = () => fetchPages()
      expect(test).to.throw
    })
  })

  describe ('Fetch JG Pages', () => {
    beforeEach (() => {
      updateClient({ baseURL: 'https://api.justgiving.com' })
    })

    afterEach (() => {
      updateClient({ baseURL: 'https://everydayhero.com' })
    })

    it ('uses the correct url to fetch pages', (done) => {
      fetchPages({ campaign: 'CAMPAIGN_ID' })
      moxios.wait(() => {
        const request = moxios.requests.mostRecent()
        expect(request.url).to.contain('https://api.justgiving.com/v1/onesearch')
        expect(request.url).to.contain('campaignId=CAMPAIGN_ID')
        done()
      })
    })

    it ('throws if no params are passed in', () => {
      const test = () => fetchPages()
      expect(test).to.throw
    })
  })
})
