import type { Refiners, Sort, Filter, ActionableFilter, ActionableSort, RefinementOptions } from "./types";
import { computed, onMounted, nextTick } from "vue";
import { useQuery } from "./use-query";
import { getProp } from "./utils";


const SORT_FIELD = 'sort';
const ORDER_FIELD = 'order';

export const useRefinements = (name: string, props?: object, options: RefinementOptions = {}) => {
    const { 
        watch = true,
        // transforms = {} 
    } = options

    const refiners = computed(() => getProp(name, props) as Refiners)

    // const refiners = getPropAsRef(name, props) as Ref<Refiners>

    const query = useQuery({
        _auto: false,
        _watch: watch
    })
    
    const sorts = computed(() => (
        Object.entries(refiners.value.sorts).reduce((result: { [key: string]: ActionableSort }, [key, sort]) => {
            result[key] = {
                ...sort,
                action: () => {
                    applySort(sort.name, sort.direction);
                },
                clear: () => {
                    clearSort();
                }
            };
            return result;
        }, {}))
    );

    const filters = computed(() => (Object.entries(refiners.value.filters).reduce((result: { [key: string]: ActionableFilter }, [key, filter]) => {
            result[key] = {
                ...filter,
                action: (value: any) => {
                    applyFilter(filter.name, value, filter.type);
                },
                clear: () => {
                    clearFilter(filter.name);
                }
            };
            return result;
        }, {}))
    );

    const getSort = (name: string): Sort|undefined => sorts.value[name]

    const getFilter = (name: string): Filter|undefined => filters.value[name]

    const reset = (): void => {
        clearSorts()
        clearFilters()
    }

    const currentSorts = (): Sort[] => Object.values(sorts.value).filter(({ active }) => active)

    const clearSorts = () => clearSort()

    const clearSort = (): void => {
        query.clear(SORT_FIELD)
        query.clear(ORDER_FIELD)
    }

    const applySort = (name: string, direction?: string):void => {
        query.set(SORT_FIELD, name)
        query.set(ORDER_FIELD, direction)
    }

    const loopSort = (name: string, direction?: string): void => {
        if (!direction) clearSort()
        else applySort(name, direction)
    }

    const currentFilters = (): Filter[] => Object.values(filters.value).filter(({ active }) => active)
    
    const clearFilters = () => Object.keys(filters.value).forEach((filter) => clear(filter))

    const clearFilter = (name: string): null => clear(name)
    
    const clear = (name: string): null => query.clear(name)

    const applyFilter = (name: string, value: any, type?: string|null): void => {
        type === 'select' ? query.add(name, value) : query.set(name, value)
    }

    const isSorting = (name?: string): boolean => {
        if (name) return currentSorts().some(({ active }) => active)
        return currentSorts().length !== 0
    }

    const isFiltering = (name?: string): boolean => {
        if (name) return currentFilters().some(({ active }) => active)
        return currentFilters().length !== 0
    }

    onMounted(async () => {
        query.pause()
        if (Object.values(sorts.value).length > 0) {
            query.set(SORT_FIELD, null)
            query.set(ORDER_FIELD, null)
        }
        Object.values(filters.value).forEach((filter: Filter) => query.set(filter.name, null))
        const searchParams = query.get()
        Object.keys(searchParams).forEach((key) => key in query.params ? query.set(key, searchParams[key]) : null)
        await nextTick()
        if (watch) query.resume()
    })

    return {
        /**
		 * Query param state for direct manipulation
		 */
        params: query.params,
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
        update: query.update,
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
        /**
         * Generic clear for any param
         */
        clear: query.clear,
        /**
         * Generic set for any param
         */
        set: query.set,
        /**
         * Settter which handles array parameters
         */
        add: query.add,
    }
}