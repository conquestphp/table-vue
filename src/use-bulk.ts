import { reactive, computed } from 'vue'

export interface Selection<T = any> {
    /** Whether all records are selected. */
	all: boolean
	/** Included records. */
	only: Set<T>
	/** Excluded records. */
	except: Set<T>
}

export function useBulkSelect<T = any>() {
    const selection = reactive<Selection<T>>({
        all: false,
        only: new Set(),
        except: new Set()
    }) as Selection<T>

    const selectAll = (): void => {
        selection.all = true
        selection.only.clear()
        selection.except.clear()
    }

    const deselectAll = ():void => {
        selection.all = false
        selection.only.clear()
        selection.except.clear()
    }

    const select = (...rows: T[]): void => {
        rows.forEach((row) => selection.except.delete(row))
        rows.forEach((row) => selection.only.add(row))
    }

    const deselect = (...rows: T[]) => {
        rows.forEach((row) => selection.only.delete(row))
        rows.forEach((row) => selection.except.add(row))
    }

    const selected = (row: T): boolean => {
        if (selection.all) return !selection.except.has(row)
        return selection.only.has(row)
    }

    const toggle = (...rows: T[]): void => {
        rows.forEach((row) => {
            const isSelected = selected(row)
            if (isSelected) deselect(row)
            else select(row)
        })
    }

    const allSelected = computed(() => selection.all && selection.except.size === 0)

    return reactive({
        /**
         * Check whether are rows are selected
         */
        allSelected,
        /**
         * Get the current selection
         */
        selection,
        /**
         * Select all rows
         */
        selectAll,
        /**
         * Deselect all rows
         */
        deselectAll,
        /**
         * Select the given row(s)
         */
        select,
        /**
         * Deselect the given row(s)
         */
        deselect,
        /**
         * Toggle selection for the given row(s)
         */
        toggle,
        /**
         * Check if the given row is selected
         */
        selected,
        /**
         * Number of selected elements
         */
        // count: computed(() => {

        // })
    })
}