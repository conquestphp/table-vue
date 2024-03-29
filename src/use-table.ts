import type { RefinementOptions, UseTableProps, Column, ActionableColumn } from "./types";
import { useRefinements } from "./use-refinements";
import { useBulkSelect } from "./use-bulk";
import { reactive, toRef, computed } from "vue";
import { getPageProps } from "./utils";
import { useActions } from "./use-actions";

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
        cols: computed(() => {
            return table.value.cols.reduce((acc: ActionableColumn[], col: Column) => {
                if (!col.hidden) { // Filter condition
                    const newCol: ActionableColumn = {
                        ...col,
                        sort: col.has_sort ? () => refinements.loopSort(col.sort_field, col.next_direction) : () => {},
                        clear: () => refinements.clearSort()
                    };
                    acc.push(newCol);
                }
                return acc;
            }, []);
        }),
        /**
         * List of rows for the table 
         */
        rows: computed(() => table.value.rows.map((row) => ({
            ...row,
            key: getRowKey(row),
            select: () => bulk.select(getRowKey(row)),
            deselect: () => bulk.deselect(getRowKey(row)),
            toggle: () => bulk.toggle(getRowKey(row)),
            isSelected: computed(() => bulk.selected(getRowKey(row))),
        }))),
        /** 
         * Pagination data for the table 
         */
        meta: computed(() => table.value.meta),
        /**
         * Actions for the table
         */
        actions: useActions(table.value.actions),
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
         * Unique identifier for columns on this table if provided
         */
        recordKey,
        /** 
         * Filtering and sort options
         */
        ...refinements,
        
        
    })
}