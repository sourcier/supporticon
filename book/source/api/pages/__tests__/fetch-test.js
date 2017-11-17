import moxios from 'moxios'
import { fetchPages } from '..'
import { instance } from '../../../utils/client'

describe ('Fetch Pages', () => {
  beforeEach (() => {
    moxios.install(instance)
  })

  afterEach (() => {
    moxios.uninstall(instance)
  })

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