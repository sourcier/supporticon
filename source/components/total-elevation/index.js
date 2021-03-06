import React, { Component } from 'react'
import PropTypes from 'prop-types'
import numbro from 'numbro'
import { fetchFitnessLeaderboard } from '../../api/fitness-leaderboard'
import { fetchFitnessTotals } from '../../api/fitness-totals'
import { isJustGiving } from '../../utils/client'
import { formatElevation } from '../../utils/fitness'

import Icon from 'constructicon/icon'
import Loading from 'constructicon/loading'
import Metric from 'constructicon/metric'

class TotalElevation extends Component {
  constructor () {
    super()
    this.fetchData = this.fetchData.bind(this)
    this.fetchEDHElevation = this.fetchEDHElevation.bind(this)
    this.fetchJGElevation = this.fetchJGElevation.bind(this)
    this.state = { status: 'fetching' }
  }

  componentDidMount () {
    const { refreshInterval } = this.props
    this.fetchData()
    this.interval =
      refreshInterval && setInterval(this.fetchData, refreshInterval)
  }

  componentWillUnmount () {
    clearInterval(this.interval)
  }

  fetchData () {
    const fetchElevation = isJustGiving()
      ? this.fetchJGElevation
      : this.fetchEDHElevation

    fetchElevation()
      .then(data => this.setState({ data, status: 'fetched' }))
      .catch(error => {
        this.setState({ status: 'failed' })
        return Promise.reject(error)
      })
  }

  fetchEDHElevation () {
    const { activity, campaign, includeManual } = this.props

    return fetchFitnessLeaderboard({
      activity,
      campaign,
      include_manual: includeManual,
      limit: 9999,
      sortBy: 'elevation'
    }).then(data => this.calculateTotal(data))
  }

  fetchJGElevation () {
    const { campaign, startDate, endDate } = this.props

    return fetchFitnessTotals({ campaign, startDate, endDate }).then(
      totals => totals.elevation
    )
  }

  calculateTotal (data) {
    return data.reduce((total, item) => total + item.elevation_in_meters, 0)
  }

  render () {
    const { icon, label, metric } = this.props

    return (
      <Metric
        icon={icon}
        label={label}
        amount={this.renderAmount()}
        amountLabel={this.renderAmountLabel()}
        {...metric}
      />
    )
  }

  renderAmount () {
    const { status, data } = this.state
    const { format, miles, multiplier, offset, units } = this.props
    const amount = (offset + data) * multiplier

    switch (status) {
      case 'fetching':
        return <Loading />
      case 'failed':
        return <Icon name='warning' />
      default:
        return units
          ? formatElevation(amount, miles)
          : numbro(amount).format(format)
    }
  }

  renderAmountLabel () {
    const { status, data } = this.state
    const { format, miles, multiplier, offset, units } = this.props
    const amount = (offset + data) * multiplier

    switch (status) {
      case 'fetching':
        return 'Loading'
      case 'failed':
        return 'Error'
      default:
        return units
          ? formatElevation(amount, miles, 'full')
          : numbro(amount).format(format)
    }
  }
}

TotalElevation.propTypes = {
  /**
   * The campaign uid/s to fetch totals for
   */
  campaign: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),

  /**
   * The type of activity to get kms for
   * e.g. bike, [bike, run, walk, swim]
   */
  activity: PropTypes.oneOf([PropTypes.string, PropTypes.array]),

  /**
   * Include manual fitness activities
   */
  includeManual: PropTypes.bool,

  /**
   * Offset
   */
  offset: PropTypes.number,

  /**
   * The amount to multiply the total by for custom conversions
   */
  multiplier: PropTypes.number,

  /**
   * The format of the number
   */
  format: PropTypes.string,

  /**
   * The label of the metric
   */
  label: PropTypes.string,

  /**
   * Use imperial units (miles, feet, yards)
   */
  miles: PropTypes.bool,

  /**
   * Include elevation units?
   */
  units: PropTypes.bool,

  /**
   * Start date filter (ISO Format)
   */
  startDate: PropTypes.string,

  /**
   * End date filter (ISO Format)
   */
  endDate: PropTypes.string,

  /**
   * The icon to use
   * - String representing a constructicon icon e.g. heart
   * - Array of custom paths
   * - An element to use instead e.g. <i className='fa fa-heart' />
   */
  icon: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
    PropTypes.element
  ]),

  /**
   * Props to be passed to the Constructicon Metric component
   */
  metric: PropTypes.object,

  /**
   * Interval (in milliseconds) to refresh data from API
   */
  refreshInterval: PropTypes.number
}

TotalElevation.defaultProps = {
  format: '0,0',
  label: 'Total Elevation',
  miles: false,
  multiplier: 1,
  offset: 0,
  units: true
}

export default TotalElevation
