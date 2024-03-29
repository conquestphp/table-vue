import type { Refiners, Sort, Filter, ActionableFilter, ActionableSort, RefinementOptions } from "./types";
import queryString from "query-string"
import { toRef, reactive, computed, onMounted, nextTick } from "vue";
import { router } from "@inertiajs/vue3";
import { watchPausable } from "@vueuse/core"
import { emptyValue } from "./utils";

const SORT_FIELD = 'sort';
const ORDER_FIELD = 'order';

export const useRefinements = (props: Refiners, options: RefinementOptions = {}) => {
    const { 
        watch = true, 
        transforms = {} 
    } = options

    const refiners = toRef(props)
   
    const params = reactive({})

    const transformParams = () => {
        let transformed = {}

        /** Has to loop over params to remove empty values */
        for (const key in params) {
            if (emptyValue(params[key])) {
                continue
            } else if (key in transforms) {
                transformed[key] = transforms[key](params[key])
            } else {
                transformed[key] = params[key]
            }
        }
        return transformed
    }

    const update = () => {        
        const url = queryString.stringifyUrl(
            {
                url: location.origin + location.pathname,
                query: { ...transformParams(), 
                    page: undefined },
            },
            {
                arrayFormat: "comma",
            }
        )

        router.visit(url, {
            preserveScroll: true,
            preserveState: true,
        })
    }

    const { pause, resume } = watchPausable(params, update)
    
    const sorts = computed(() => refiners.value.sorts.map((sort: Sort): ActionableSort => {
        return {
            ...sort,
            action: () => {
                applySort(sort.name, sort.direction)
            },
            clear: () => {
                clearSort()
            }
        }
    }))

    const filters = computed(() => refiners.value.filters.map((filter: Filter): ActionableFilter => {
        return {
            ...filter,
            action: (value: any) => {
                applyFilter(filter.name, value)
            },
            clear: () => {
                clearFilter(filter.name)
            }
        }
    }))

    const getSort = (name: string): Sort|undefined => {
        return sorts.value.find((sort: Sort) => sort.name === name)
    }

    const getFilter = (name: string): Sort|undefined => {
        return filters.value.find((filter: Filter) => filter.name === name)
    }

    const reset = (): void => {
        clearSorts()
        clearFilters()
    }

    const currentSorts = (): Sort[] => sorts.value.filter(({ active }) => active)

    const clearSorts = () => clearSort()

    const clearSort = (): void => {
        params[SORT_FIELD] = null
        params[ORDER_FIELD] = null
    }

    const applySort = (name: string, direction: string):void => {
        params[SORT_FIELD] = name
        params[ORDER_FIELD] = direction
    }

    const loopSort = (name: string, direction?: string): void => {
        if (!direction) {
            clearSort()
        } else {
            applySort(name, direction)
        }
    }

    const currentFilters = (): Filter[] => filters.value.filter(({ active }) => active)
    
    const clearFilters = () => {
        filters.value.forEach((filter) => {
            clearFilter(filter.name)
        })
    }

    const clearFilter = (name: string): void => {
            params[name] = null
    }

    const applyFilter = (name: string, value: any): void => {
        params[name] = value
    }

    const isSorting = (name?: string): boolean => {
        if (name) {
            return currentSorts().some(({ active }) => active)
        }

        return currentSorts().length !== 0
    }

    const isFiltering = (name?: string): boolean => {
        if (name) {
            return currentFilters().some(({ active }) => active)
        }

        return currentFilters().length !== 0
    }

    onMounted(async () => {
        pause()
        await nextTick()

        if (sorts.value.length > 0) {
            params[SORT_FIELD] = null
            params[ORDER_FIELD] = null
        }

        filters.value.forEach((filter: Filter) => {
            params[filter.name] = null
        })

        const query = queryString.parse(location.search, { arrayFormat: 'comma' })

        Object.keys(query).forEach((key) => {
            if (key in params) {
                params[key] = query[key]
            }
        })
        await nextTick()
        if (watch) resume()
    })

    return {
        /**
		 * Query param state for direct manipulation
		 */
        params,
        /**
		 * Available sorts
		 */
        sorts,
        /**
		 * Available filters
		 */
        filters,
        /**
         * Execute router reload with new params
         */
        update,
        /**
         * Get the filter by name
         */
        getFilter, 
        /**
         * Get the sort by name
         */
        getSort, 
        /**
         * Reset query params
         */
        reset, 
        /**
         * Get the currently active sorts
         */
        currentSorts, 
        /**
         * Get the currently active filters
         */
        currentFilters, 
        /**
         * Check if a filter is active by name
         */
        isFiltering,
        /**
         * Check if a sort is active by name
         */
        isSorting,
        /**
         * Apply a filter
         */
        applyFilter, 
        /**
         * Apply a sort
         */
        applySort,
        /**
         * Clear all filters to default
         */
        clearFilters,
        /**
         * Clear a filter by name`
         */
        clearFilter,
        /**
         * Clear all sorts to default
         */
        clearSorts, 
        /**
         * Clear a sort by name -> same as clearSorts
         */
        clearSort, 
        /**
         * Loop through state machine for sorting
         */
        loopSort,
    }
}