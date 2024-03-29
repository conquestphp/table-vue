import { ComputedRef } from "vue";

/** Interface for the Refiners class */
export interface Refiners {
    sorts: Sort[];
    filters: Filter[];
}

export interface Option {
    label: string
    value: any
    metadata: any
    active: boolean
}

export interface Refinement {
    name: string;
    label: string;
    type: string|null;
    metadata: any;
    active: boolean;
}

/** Filters */
interface BaseFilter extends Refinement {
    value: any;
    options: Option[]
}

export interface Filter extends BaseFilter { }

/** Sorts */
interface BaseSort extends Refinement { }

export interface Sort extends BaseSort {
    direction: string;
}

export interface ToggleSort extends BaseSort {
    next_direction: string|null
}

/** Interface for the Actions class */
export interface Actions {
    inline: InlineAction[]
    bulk: BulkAction[]
    page: PageAction[]
    default?: InlineAction
}

export interface BaseAction {
    name: string;
    label: string;
    metadata: any;
}

export interface BulkAction extends BaseAction { }

export interface InlineAction extends BaseAction { }

type HttpMethod = 'get' | 'post' | 'patch' | 'put' | 'delete' 

interface ActionEndpoint {
    method: HttpMethod
    route: string
}

export interface PageAction extends BaseAction {
    has_endpoint: boolean;
    endpoint: ActionEndpoint|null
}

/** Interface for the Table class */

interface PagingOption {
    value: number;
    label: number;
    active: boolean
}

interface PagingOptions {
    options: PagingOption[]
    term: string
}

interface PreferenceCol {
    name: string
    label: string
    active: boolean
}

interface Meta {
    empty: boolean;
    show: boolean;
}

export interface UnpaginatedMeta extends Meta { }

export interface CursorPaginatedMeta extends Meta {
    per_page: number;
    next_cursor?: string;
    prev_cursor?: string;
    next_url?: string;
    prev_url?: string;
}

interface Link {
    url: string;
    label: string;
    active: boolean;
}

export interface PaginatedMeta extends Meta {
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    first_url: string;
    last_url: string;
    next_url?: string;
    prev_url?: string;
    links: Link[]
}

export interface Column {
    name: string;
    type: string;
    label: string;
    metadata?: any
    fallback?: string;

    has_sort: boolean;
    active?: boolean;
    direction?: string;
    next_direction?: string;
    sort_field: string

    hidden?: boolean;
    breakpoint?: string|null;
    sr_only?: boolean;

    dynamic?: boolean;
    dynamic_active?: boolean   
}

export interface Table {
    meta: PaginatedMeta | CursorPaginatedMeta | UnpaginatedMeta;
    cols: Column[];
    rows: Row[];
    refinements: Refiners;
    actions: Actions;
    recordKey: string;
    paging_options?: PagingOptions
    preference_cols?: PreferenceCol[]
}

/** Javascript API */
export interface UseTableProps {
    recordKey: string;
    cols: Column[];
    rows: Row[];
    meta: PaginatedMeta | CursorPaginatedMeta | UnpaginatedMeta;
    refinements: Refiners;
    actions: {
        inline: InlineAction[];
        page: PageAction[];
        bulk: BulkAction[];
        default?: InlineAction;
    }
    show?: number
}


export interface UseRefinement {
    params: any;
    sorts: ActionableSort[];
    filters: ActionableFilter[];
    setQuery: (fieldQuery: string, value: any) => void;
    updateQuery: () => void;
    getQuery: () => any;
    clearQuery: () => void;
}

export interface ActionablePageAction extends PageAction {
    execute: () => void;
}

export interface UseTable {
    rawCols: Column[]
    cols: ActionableColumn[];
    rows: ActionableRow[];
    meta: ComputedRef<PaginatedMeta|CursorPaginatedMeta|UnpaginatedMeta>;
    refinements: Refinements;
    actions: {
        inline: ComputedRef<InlineAction[]>;
        page: ComputedRef<ActionablePageAction[]>;
        bulk: ComputedRef<BulkAction[]>;
        default?: InlineAction;
    },
    selectAll: () => void;
    deselectAll: () => void;
    isSelected: (row: string) => boolean;
    allSelected: () => boolean;
    selection: ComputedRef<string[]>;
    toggle: (row: string) => void;
    select: (row: string) => void;
    deselect: (row: string) => void;
    recordKey: string;
    show?: number
}

export interface RefinementOptions {
    watch?: boolean;
    transforms?: {
        [key: string]: (value: any) => any;
    }
}

interface Clears {
    clear: () => void;
}

export interface ActionableFilter extends Filter, Clears {
    action: (value: any) => void;
}

export interface ActionableSort extends Sort, Clears {
    action: () => void;
}

export interface ActionableColumn extends Column {
    sort: () => void;
    clear: () => void;
}

export interface ActionableRow extends Extend {
    key: string;
    select: () => void;
    deselect: () => void;
    toggle: () => void;
    isSelected: ComputedRef<boolean>;
}

