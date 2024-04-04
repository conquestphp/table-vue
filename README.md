# Vanguard
`vanguard-client`, or simply Vanguard, is the Vue 3 client library for the Vanguard Laravel project using InertiaJS. It provides a set of composables to interface with the Vanguard API.
## Table of Contents

## Installation
To install using NPM:
```console
npm i vanguard-client
```

It requires any version of Vue 3+, and uses the stable release of InertiaJS 1.0.0. The queryString is a fluent way to interface with search params, and ensures consistency from the server to client.

## Composables
### useTable
`useTable` provides the direct interface to the Vanguard Table class, the core functionality of the package. A `Table` class should be passed to the Inertia rendered page as a property. The composable will then transform it into a reactive object that can be used in the template.

```js
import { useTable } from 'vanguard-client'

defineProps({
    users: Object
})

const usersTable = useTable('users')
```

The composable requires a first argument, being the name of the property passed from the server. The optional second argument is the properties to search for the key in - this is used to extend the search if the props are nested in an object. The third argument is an optional options parameter to modify the behaviour of the querying composables.

```js
import { useTable } from 'vanguard-client'

const props = defineProps({
    users: Object
})

const usersTable = useTable('users', props, { watch: false })
```

This will prevent the table from refreshing automatically if a filter or sort is modified, enforcing manual control. The table has the followed properties and methods available:

| Attribute | Type | Description |
---------- | -------------- | ------------------
`recordKey` | `string` | The key to use as the record identifier
`cols` | `Array` | The non-hidden columns to be used as table headings
`rows` | `Array` | The rows to be displayed in the table
`meta` | `Object` | The meta data for the rows, dependent on the selected pagination type
`actions` | `Object` | The actions associated with this table
`params` | `Object` | The search query parameters for the table
`sorts` | `Array` | The sorts for the table
`filters` | `Array` | The filters for the table
`update` | `Function` | Perform a manual update of the table using search parameters
`getFilter` | `Function` | Get the filter value by name
`getSort` | `Function` | Get the sort value by name
`reset` | `Function` | Reset the query params
`currentSorts` | `Function` | Get an array of currently active sorts
`currentFilters` | `Function` | Get an array of currently active filters





### useRefinements

### useBulk

### useActions


### useQuery
`useQuery` provides a 