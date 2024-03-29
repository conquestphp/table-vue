import type { RefinementOptions, Column, ActionableColumn, PreferenceCol, Table } from "./types";
import { useRefinements } from "./use-refinements";
import { useBulkSelect } from "./use-bulk";
import { reactive, toRef, computed } from "vue";
import { useActions } from "./use-actions";

type RowIdentifier = string | number;

export const useTable = <T extends object>(prop: Table, refinementOptions: RefinementOptions) => {
    const table = toRef(prop)
    const recordKey = table.value.recordKey
    const hasBulkActions = table.value.actions.bulk.length > 0
    const bulk = hasBulkActions ? useBulkSelect() : null
    const refinements = useRefinements(prop.refinements, refinementOptions)

    const getRowKey = (row: T): RowIdentifier => {
		if (typeof row !== 'object') return row		

		if (Reflect.has(row, '__hybridId')) {
			return Reflect.get(row, '__hybridId') as any
		}

		return Reflect.get(row, recordKey) as any
	}

    const bulkActions = hasBulkActions ? {
        /** 
         * Selects all records. 
         */
        selectAll: bulk?.selectAll,
		/** 
         * Deselects all records. 
         */
        deselectAll: bulk?.deselectAll,
		/** 
         * Checks if the given record is selected. 
         */
        isSelected: (row: T) => bulk?.selected(getRowKey(row)),
		/** 
         * Whether all records are selected. 
         */
        allSelected: bulk?.allSelected,
		/** 
         * The current record selection. 
         */
        selection: bulk ? toRef(bulk, 'selection') : null,
        /** 
         * Toggles selection for the given record. 
         */
        toggle: (row: T) => bulk?.toggle(getRowKey(row)),
		/** 
         * Selects selection for the given record. 
         */
        select: (row: T) => bulk?.select(getRowKey(row)),
		/** 
         * Deselects selection for the given record. 
         */
        deselect: (row: T) => bulk?.deselect(getRowKey(row)),
    } : {}

    const preferences = table.value.preference_cols ? {
        preferences: computed(() => {
            return table.value.preference_cols.map((col: PreferenceCol) => ({
                ...col,
                set: (value: any) => refinements.set(col.key, value),
                clear: () => refinements.clear(col.key)
            }))
        })
    } : {}
    

    return reactive({
        /**
         * Unique identifier for columns on this table if provided
         */
        recordKey,
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
        rows: computed(() => table.value.rows.map((row: T) => ({
            ...row,
            key: getRowKey(row),
            select: hasBulkActions ? () => bulk?.select(getRowKey(row)) : () => {},
            deselect: hasBulkActions ? () => bulk?.deselect(getRowKey(row)) : () => {},
            toggle: () => hasBulkActions ? bulk?.toggle(getRowKey(row)) : () => {},
            isSelected: computed(() => hasBulkActions ? bulk?.selected(getRowKey(row)) : false),
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
         * Conditionally apply the bulk actions if they exist
         */
        ...bulkActions,
        /**
         * Columns with available preferences
         */
        ...preferences,
        /** 
         * Filtering and sort options
         */
        ...refinements,
        
        
    })
}