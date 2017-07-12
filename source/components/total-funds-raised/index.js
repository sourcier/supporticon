import React, { Component } from 'react'
import PropTypes from 'prop-types'
import numbro from 'numbro'
import Icon from 'constructicon/icon'
import Metric from 'constructicon/metric'

import {
  fetchDonationTotals,
  deserializeDonationTotals
} from '../../api/donation-totals'

class TotalFundsRaised extends Component {
  constructor () {
    super()
    this.state = { status: 'fetching' }
  }

  componentDidMount () {
    const {
      campaign,
      charity,
      group,
      startDate,
      endDate
    } = this.props

    fetchDonationTotals({
      campaign,
      charity,
      group,
      startDate,
      endDate
    })
      .then((data) => {
        this.setState({
          status: 'fetched',
          data: deserializeDonationTotals(data)
        })
      })
      .catch((error) => {
        this.setState({
          status: 'failed'
        })
        return Promise.reject(error)
      })
  }

  render () {
    const {
      icon,
      label,
      metric
    } = this.props

    return (
      <Metric
        icon={icon}
        label={label}
        amount={this.renderAmount()}
        {...metric}
      />
    )
  }

  renderAmount () {
    const {
      status,
      data = {}
    } = this.state

    switch (status) {
      case 'fetching':
        return <Icon name='loading' spin />
      case 'failed':
        return <Icon name='warning' />
      default:
        return numbro((this.props.offset + data.raised) / 100).format('$0,0')
    }
  }
}

TotalFundsRaised.propTypes = {
  /**
  * The campaign uid to fetch totals for
  */
  campaign: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array
  ]),

  /**
  * The charity uid to fetch totals for
  */
  charity: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array
  ]),

  /**
  * The group value(s) to filter by
  */
  group: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array
  ]),

  /**
  * Start date filter (ISO Format)
  */
  startDate: PropTypes.string,

  /**
  * End date filter (ISO Format)
  */
  endDate: PropTypes.string,

  /**
  * Offset
  */
  offset: PropTypes.number,

  /**
  * The label of the metric
  */
  label: PropTypes.string,

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
  metric: PropTypes.object
}

TotalFundsRaised.defaultProps = {
  label: 'Funds Raised',
  offset: 0
}

export default TotalFundsRaised