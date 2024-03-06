import type { RefinementOptions, UseTableProps, Column } from "./types";
import { useRefinements } from "./use-refinements";
import { useBulkSelect } from "./use-bulk";
import { reactive, toRef, computed } from "vue";
import { getPageProps } from "./utils";
import { router } from "@inertiajs/vue3";

type RowIdentifier = string | number;

export const useTable = (propName: string, refinementOptions: RefinementOptions) => {
    const table = computed(() => getPageProps(propName) as UseTableProps)
    const recordKey = table.value.recordKey
    const bulk = useBulkSelect()
    const refinements = useRefinements(propName + '.refinements', refinementOptions)

    const getRowKey = (row: any): RowIdentifier => {
		if (typeof row !== 'object') return row		

		if (Reflect.has(row, '__hybridId')) {
			return Reflect.get(row, '__hybridId') as any
		}

		return Reflect.get(row, recordKey) as any
	}

    return reactive({
        /** 
         * List of columns for the table 
         */
        cols: computed(() => table.value.cols.map((col: Column) => ({
            ...col,
            sort: () => col.has_sort ? refinements.loopSort(col.sort_field, col.next_direction) : null,
            clear: () => refinements.clearSort(),
        }))),
        /**
         * List of rows for the table 
         */
        rows: computed(() => table.value.rows.map((row) => ({
            ...row,
            key: getRowKey(row),
            select: () => bulk.select(getRowKey(row)),
            deselect: () => bulk.deselect(getRowKey(row)),
            toggle: () => bulk.toggle(getRowKey(row)),
            isSelected: computed(() => {
                console.log('Execute')
                return bulk.selected(getRowKey(row))
            }),
            // execute: ()
            // actions
        }))),
        /** 
         * Pagination data for the table 
         */
        meta: computed(() => table.value.meta),
		/** 
         * List of inline actions for this table. 
         */
        inlineActions: computed(() => table.value.actions.inline.map((action) => ({
            ...action
        }))),
		/** 
         * List of bulk actions for this table. 
         */
        bulkActions: computed(() => table.value.actions.bulk.map((action) => ({
            ...action,
            // execute: () => executeBulkAction()
        }))),
		/** 
         * List of page actions for this table. 
         */
        pageActions: computed(() => table.value.actions.page.map((action) => ({
            ...action,
            execute: (data: object, options?: object) => {
                if (! action.has_endpoint) return 

                router[action.endpoint.method](action.endpoint.route, {
                    ...data,
                },{
                    ...options
                })
            }
        }))),
		/** 
         * Selects all records. 
         */
        selectAll: bulk.selectAll,
		/** 
         * Deselects all records. 
         */
        deselectAll: bulk.deselectAll,
		/** 
         * Checks if the given record is selected. 
         */
        isSelected: (row: any) => bulk.selected(getRowKey(row)),
		/** 
         * Whether all records are selected. 
         */
        allSelected: bulk.allSelected,
		/** 
         * The current record selection. 
         */
        selection: toRef(bulk, 'selection'),
		/** 
         * Toggles selection for the given record. 
         */
        toggle: (row: any) => bulk.toggle(getRowKey(row)),
		/** 
         * Selects selection for the given record. 
         */
        select: (row: any) => bulk.select(getRowKey(row)),
		/** 
         * Deselects selection for the given record. 
         */
        deselect: (row: any) => bulk.deselect(getRowKey(row)),
		/**
         *  Executes the given inline action for the given record. 
         */
        // executeInlineAction,
        // /** 
        //  * Executes the given bulk action 
        //  */
        // executeBulkAction,
        // /** 
        //  * Executes the given page action 
        //  */
        // executePageAction,
        /**
         * Unique identifier for columns on this table if provided
         */
        recordKey,
        /** 
         * Filtering and sort options
         */
        ...refinements,
        
        
    })
}