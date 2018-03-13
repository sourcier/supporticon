import { get } from '../../../utils/client'
import { required } from '../../../utils/params'

export const fetchPagesTotals = (params = required()) => {
  const finalParams = {
    ...params,
    page: 1,
    limit: 1
  }

  const mappings = {
    type: 'type',
    startDate: 'start_updated_at',
    endDate: 'end_updated_at'
  }

  return get('api/v2/pages', finalParams, { mappings }).then((results) => results.meta.count)
}