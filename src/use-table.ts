import type { RefinementOptions, Column, ActionableColumn, PreferenceColumn, Table } from "./types";
import { useRefinements } from "./use-refinements";
import { useBulkSelect } from "./use-bulk";
import { reactive, toRef, computed } from "vue";
import { useActions } from "./use-actions";
import { getProp } from "./utils";

type RowIdentifier = string | number;

export const useTable = <T extends object>(name: string, props?: object, options: RefinementOptions = {}) => {
    const table = computed(() => getProp(name, props) as Table)

    const recordKey = table.value.recordKey
    
    const refinements = useRefinements('refinements', table.value, options)

    const getRowKey = (row: T): RowIdentifier => {
		if (typeof row !== 'object') return row		

		if (Reflect.has(row, '__hybridId')) {
			return Reflect.get(row, '__hybridId') as any
		}

		return Reflect.get(row, recordKey) as any
	}

    const hasBulkActions = table.value.actions.bulk.length > 0
    const bulk = hasBulkActions ? useBulkSelect() : null
    const bulkActions = hasBulkActions ? {
        /** 
         * Whether all records are selected. 
         */
        allSelected: bulk?.allSelected,
        /** 
         * The current record selection. 
         */
        selection: bulk ? toRef(bulk, 'selection') : null,
        /** 
         * Selects all records. 
         */
        selectAll: bulk?.selectAll,
		/** 
         * Deselects all records. 
         */
        deselectAll: bulk?.deselectAll,
        /** 
         * Selects selection for the given record. 
         */
        select: (row: T) => bulk?.select(getRowKey(row)),
        /** 
         * Deselects selection for the given record. 
         */
        deselect: (row: T) => bulk?.deselect(getRowKey(row)),
		/** 
         * Checks if the given record is selected. 
         */
        selected: (row: T) => bulk?.selected(getRowKey(row)),
        /** 
         * Toggles selection for the given record. 
         */
        toggle: (row: T) => bulk?.toggle(getRowKey(row)),
    } : {}

    const preferences = table.value.preference_cols !== undefined ? {
        preferences: computed(() => {
            return table.value.preference_cols !== undefined ? table.value.preference_cols.map((col: PreferenceColumn) => ({
                ...col,
                set: (value: any) => refinements.add(col.name, value),
                clear: () => refinements.clear(col.name)
            })) : null
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
                    acc.push({
                        ...col,
                        sort: col.has_sort ? () => refinements.loopSort(col.sort_field, col.next_direction) : () => {},
                        clear: col.has_sort ? () => refinements.clearSort() : () => {}
                    });
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
            ...(hasBulkActions ? { 
                select: () => bulk?.select(getRowKey(row)),
                deselect: () => bulk?.deselect(getRowKey(row)),
                toggle: () => bulk?.toggle(getRowKey(row)),
                isSelected: computed(() => bulk?.selected(getRowKey(row))),
                selected: bulk?.selected(getRowKey(row)) 
            } : {}),
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
         * Columns with available preferences if enabled
         */
        ...preferences,
        /** 
         * Filter and sort options
         */
        ...refinements,       
    })
}