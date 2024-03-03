interface Meta {
    empty: boolean;
    show: boolean;
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

export interface UseTable {
    rows: any[];
    cols: Column[];
    meta: PaginatedMeta | CursorPaginatedMeta | UnpaginatedMeta;
    refinements: UseRefinement;
    actions: {
        row: Action[];
        bulk: Action[];
        default?: Action;
    }
}

export interface RefinementOptions {
    watch?: boolean;
    transforms?: {
        [key: string]: (value: any) => any;
    }
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
    label: string;
    type: string;
    metadata?: any
    has_sort: boolean;
    active?: boolean;
    direction?: string;
    next_direction?: string;
    fallback?: string;
    sort_field?: string
}

export interface Refinement {
    name: string;
    label: string;
    type: string;
    metadata?: any;
    hidden: boolean;
    default?: any;
    active: boolean;
}

export interface Filter extends Refinement { }

export interface Sort extends Refinement {
    direction?: string;
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

export interface Action {
    name: string;
    label: string;
    metadata?: any;
    hidden: boolean;
}

export interface BulkAction extends Action { }
export interface InlineAction extends Action { }

export interface Actionndpoint {
    method: string
    route: string
}

export interface PageAction extends Extend {
    has_endpoint: boolean;
    endpoint: ActionEndpoint|null
}

export interface Refinements {
    filters?: Filter[];
    sorts?: Sort[];
}

export interface UseTableProps {
    recordKey: string;
    rows: any[];
    cols: Column[];
    meta: PaginatedMeta | CursorPaginatedMeta | UnpaginatedMeta;
    refinements: Refinements;
    actions: {
        inline: InlineAction[];
        page: PageAction[];
        bulk: BulkAction[];
        default?: InlineAction;
    }
}