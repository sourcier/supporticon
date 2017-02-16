import React, { Component, PropTypes } from 'react'
import Button from 'constructicon/button'
import SearchForm from 'constructicon/search-form'
import SearchResult from 'constructicon/search-result'
import SearchResults from 'constructicon/search-results'

import {
  fetchPages,
  deserializePage
} from '../../api/pages'

class PageSearch extends Component {
  constructor () {
    super()
    this.sendQuery = this.sendQuery.bind(this)
    this.state = {
      status: 'inactive',
      data: []
    }
  }

  sendQuery (query) {
    if (!query) {
      return this.setState({
        q: null,
        status: 'inactive',
        data: []
      })
    }

    this.setState({
      q: query,
      status: 'fetching'
    })

    return fetchPages({
      q: query,
      campaign: this.props.campaign,
      charity: this.props.charity,
      type: this.props.type,
      limit: this.props.limit,
      page: this.props.page
    })
      .then((data) => {
        this.setState({
          status: 'fetched',
          data: data.map(deserializePage)
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
    return (
      <SearchForm
        onChange={this.sendQuery}
        children={this.state.status !== 'inactive' && this.renderResults()}
        button={this.props.button}
        {...this.props.searchForm}
      />
    )
  }

  renderResults () {
    const {
      status,
      q,
      data = []
    } = this.state

    return (
      <SearchResults
        loading={status === 'fetching'}
        error={status === 'failed'}
        emptyLabel={`No results found for "${q}"`}
        {...this.props.searchResults}>
        {data.map((page, i) => (
          <SearchResult
            key={i}
            title={page.name}
            subtitle={page.charity.name}
            image={page.image}
            children={this.renderLink(page)}
            {...this.props.searchResult}
          />
        ))}
      </SearchResults>
    )
  }

  renderLink (page) {
    return (
      <Button
        tag='a'
        href={page.url}
        children='Support'
        {...this.props.button}
      />
    )
  }
}

PageSearch.propTypes = {
  /**
  * The campaign uid to fetch pages for
  */
  campaign: PropTypes.oneOf([
    PropTypes.string,
    PropTypes.array
  ]),

  /**
  * The charity uid to fetch pages for
  */
  charity: PropTypes.oneOf([
    PropTypes.string,
    PropTypes.array
  ]),

  /**
  * The type of page to include in the leaderboard
  */
  type: PropTypes.oneOf([ 'individual', 'team' ]),

  /**
  * The number of records to fetch
  */
  limit: PropTypes.number,

  /**
  * The page to fetch
  */
  page: PropTypes.number,

  /**
  * Props to be passed to the SearchForm component
  */
  searchForm: PropTypes.object,

  /**
  * Props to be passed to the SearchResults component
  */
  searchResults: PropTypes.object,

  /**
  * Props to be passed to the SearchResult components
  */
  searchResult: PropTypes.object,

  /**
  * Props to be passed to the Button components
  */
  button: PropTypes.object
}

PageSearch.defaultProps = {
  limit: 10,
  type: 'team'
}

export default PageSearch
