# Goal

Helpers related to fetching supporter pages

- [fetchPages](#fetchpages)
- [fetchPage](#fetchpage)
- [fetchPageDonationCount](#fetchpagedonationcount)
- [deserializePage](#deserializepage)
- [createPage](#createpage)
- [updatePage](#updatepage)


## `fetchPages`

**Purpose**

Fetch pages from Supporter.

**Params**

- `params` (Object) see [parameter list](../readme.md#availableparameters)
- `allPages` (Boolean) Use `api/v2/pages` endpoint (EDH only)

**Returns**

A pending promise that will either resolve to:

- Success: the data returned from the request
- Failure: the error encountered

**Example**

```javascript
import { fetchPages } from 'supporticon/api/pages'

fetchPages({
  campaign: 'au-123'
})
```

## `fetchPage`

**Purpose**

Fetch a single page.

**Params**

- `id` - the page id

**Returns**

A pending promise that will either resolve to:

- Success: the page data
- Failure: the error encountered

**Example**

```javascript
import { fetchPage } from 'supporticon/api/pages'

fetchPage('12345')
```

## `fetchPageDonationCount`

**Purpose**

Fetch a single page's donation count.

**Params**

- `id` - the page id

**Returns**

A pending promise that will either resolve to:

- Success: the number of donations received by that page
- Failure: the error encountered

**Example**

```javascript
import { fetchPage } from 'supporticon/api/pages'

fetchPage('12345')
```

## `deserializePage`

A default deserializer for deserializing supporter pages

**Params**

- `data` {Object} a single supporter page to deserialize

**Returns**

The deserialized supporter page

**Example**

```javascript
import { deserializePage } from 'supporticon/api/pages'

// ...

return {
  status: 'fetched',
  data: payload.data.map(deserializePage)
}
```

## `createPage`

Create a Supporter page for an authenticated User.

See [the API documentation](http://developer.everydayhero.com/pages/#create-an-individual-page) for more information.

**Params**

- `token` (String) OAuth User Token _required_
- `campaignId` (String) Campaign UID _required_
- `birthday` (String) User Date of Birth _required_
- `charityId` (String) Charity UID
- `image` (String) Image URL for page avatar
- `name` (String) Page Name
- `story` (String) Page story
- `nickname` (String) Page Nickname
- `slug` (String) Page URL slug
- `target` (String) Page fundraising target/goal (in cents)
- `expiresAt` (String) Page expiry date
- `skipNotification` (Boolean) Skip notification email
- `fitnessGoal` (String) Page fitness goal (in metres)
- `campaignDate` (String) Optional page date
- `groupValues` (Hash/Array) Campaign group values for the page
- `giftAid` (Boolean) If page eligable for gift aid
- `inviteToken` (String) Team invite token
- `tags` (Array of Objects) Containing the following:
  - `id` (String) Create unique id, needed for reference when filtering or creating leaderboards from tags
  - `label` (String) Tag Label
  - `value` (String) Value of Tag
  - `aggregation` (Array of Object) Settings for how tag is grouped
    - `segment` (String)
    - `measurementDomains` (Array) Accepts e.g. `all`, `fundraising:donations_received`, `ride:distance`, `walk:distance`, `any:distance`

**Example of tag object shape**
```javascript
  {
    id: '123456',
    label: 'branchName',
    value: 'London',
    aggregation: [{
      segment: `Page:Campaign:${process.env.CAMPAIGN_GUID}`,
      measurementDomains: ['fundraising:donations_received', 'any:distance']
    }]
  }
```


**Returns**

A pending promise that will either resolve to:

- Success: the data returned from the request
- Failure: the error encountered

**Example**

```javascript
import { createPage } from 'supporticon/api/pages'

createPage({
  token: 'xxxxx',
  campaignId: 'au-123',
  birthday: '1970-01-01',
  name: 'Test User',
})
```

## `updatePage`

Update an existing Supporter page for an authenticated User.

**Params**

- `pageId` (String/Integer) User page id
- `params` (Object) Containing the following:
  - `token` (String) OAuth User Token _required_
  - `name` (String) Page Name
  - `target` (String) Page fundraising target/goal (in cents)
  - `slug` (String) Page URL slug
  - `story` (String) Page story
  - `image` (String) Image URL for page avatar
  - `expiresAt` (String)
  - `fitnessGoal` (String) Page fitness goal (in metres)
  - `campaignDate` (String) Optional page date
  - `groupValues` (Hash/Array) Campaign group values for the page

**Returns**

A pending promise that will either resolve to:

- Success: the data returned from the request
- Failure: the error encountered

**Example**

```javascript
import { updatePage } from 'supporticon/api/pages'

updatePage(123, {
  token: 'xxxxx',
  story: 'This is an updated story'
})
```

## `createPageTag`

Create or update a Page Tag. (JG Only)

**Params**

- `params` (Object) Containing the following:
  - `slug` (String) Page slug _required_
  - `id` (String) Tag definition ID, needed for reference when filtering or creating leaderboards from tags _required_
  - `label` (String) Tag definition label _required_
  - `value` (String) Tag value _required_
  - `aggregation` (Array of Objects) Settings for how tag is grouped
    - `segment` (String)
    - `measurementDomains` (Array) Accepts e.g. `all`, `fundraising:donations_received`, `ride:distance`, `walk:distance`, `any:distance`

**Returns**

A pending promise that will either resolve to:

- Success: the data returned from the request
- Failure: the error encountered

**Example**

```javascript
import { createPageTag } from 'supporticon/api/pages'

createPageTag({
  slug: 'my-page',
  label: 'State',
  id: 'state',
  value: 'Queensland',
  aggregation: [
    {
      segment: 'page:campaign:1234-5678-abcd-0123',
      measurementDomains: ['all']
    }
  ]
})
```
