import { ComputedRef } from "vue";

/** Interface for the Refiners class */
export interface Refiners {
    sorts: {
        [key: string]: Sort
    }
    filters: {
        [key: string]: Filter
    }
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
export interface BaseFilter extends Refinement {
    value: any;
    options: Option[]
}

export interface Filter extends BaseFilter { }

/** Sorts */
export interface BaseSort extends Refinement { }

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

export interface PreferenceColumn {
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
    preference_cols?: PreferenceColumn[]
}

/** Javascript API */
export interface ActionablePageAction extends PageAction {
    exec: (data: object, options: RouterOptions) => void;
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
    sort?: () => void;
    clear?: () => void;
}

export interface ActionableRow extends object {
    key: string;
    select?: () => void;
    deselect?: () => void;
    toggle?: () => void;
    isSelected?: ComputedRef<boolean>;
    selected?: boolean;
}

export interface ActionablePreferenceColumn extends PreferenceColumn{
    update: () => void
}

/** Composable options and props */
export interface UseQueryProps {
    _url?: string;
    _watch?: boolean;
    _auto?: boolean;
    transforms?: Transforms
    [key: string]: any;
}

export interface RefinementOptions {
    watch?: boolean;
    transforms?: Transforms
    only?: string[]
}

/** Composable returns */
interface UseTableBase extends UseRefinements {
    recordKey: string;
    cols: ComputedRef<ActionableColumn[]>;
    rows: ComputedRef<ActionableRow[]>;
    meta: ComputedRef<PaginatedMeta|CursorPaginatedMeta|UnpaginatedMeta>;
    actions: UseActions,
    // selectAll?: () => void;
    // deselectAll?: () => void;
    // isSelected?: (row: string) => boolean;
    // allSelected?: () => boolean;
    // selection?: ComputedRef<string[]>;
    // toggle?: (row: string) => void;
    // select?: (row: string) => void;
    // deselect?: (row: string) => void;
    preferences?: ComputedRef<ActionablePreferenceColumn[]>;
}

export interface UseRefinements {
    params: { [key: string]: any };
    sorts: ComputedRef<{ [key: string] : ActionableSort }>;
    filters: ComputedRef<{ [key: string] : ActionableFilter }>;
    update: () => void;
    getSort: (name: string) => Sort|undefined;
    getFilter: (name: string) => Filter|undefined;
    reset: () => void;
    currentSorts: () => Sort[];
    currentFilters: () => Filter[];
    isFiltering: () => boolean;
    isSorting: () => boolean;
    applyFilter: (name: string, value: any) => void;
    applySort: (name: string, direction: string) => void;
    clearFilters: () => void;
    clearFilter: (name: string) => void;
    clearSorts: () => void;
    clearSort: () => void;
    loopSort: (name: string, direction?: string) => void;
    clear: (key: string) => void;
    set: (key: string, value: any) => null;
    add: (key: string, value: any) => void;
}

export interface UseActions {
    inline: ComputedRef<InlineAction[]>;
    bulk: ComputedRef<BulkAction[]>;
    page: ComputedRef<ActionablePageAction[]>;
}

export interface UseQuery {
    params: { [key: string]: any };
    urlParams: () => { [key: string]: any };
    pause: () => void;
    resume: () => void;
    reset: () => void;
    get: () => { [key: string]: any };
    set: (key: string, value: any) => null;
    add: (key: string, value: any) => void;
    update: () => void;
    clear: (key: string) => null;
}


export interface Selection<T = any> {
    /** Whether all records are selected. */
	all: boolean
	/** Included records. */
	only: Set<T>
	/** Excluded records. */
	except: Set<T>
}

export interface UseBulkSelect<T = any> {
    allSelected: boolean;
    selection: Selection;
    selectAll: () => void;
    deselectAll: () => void;
    select: (...rows: T[]) => void;
    deselect: (...rows: T[]) => void;
    selected: (row: T) => boolean;
    toggle: (...rows: T[]) => void;   
}

export type UseTable = UseTableBase & (UseTableBase['actions']['bulk']['value']['length'] extends 1 ? {} : UseBulkSelect);

/** Misc */
interface RouterOptions {
    preserveScroll?: boolean;
    preserveState?: boolean;
    onSuccess?: () => void;
    onError?: () => void;
    onFinish?: () => void;
}

type Transforms = { [key: string]: (value: any) => any }
