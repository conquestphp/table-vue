import { watchPausable } from "@vueuse/core"
import queryString from "query-string"
import { router } from "@inertiajs/vue3"

import { onMounted, reactive, nextTick } from "vue"

export interface UseQueryProps {
    _url?: string;
    _watch?: boolean;
    _auto?: boolean;
    [key: string]: any;
}

export const useQuery = (props: UseQueryProps = {}) => {
    const {
        _url = location.origin + location.pathname,
        _watch = true,
        _auto = true,
        ...options
    } = props

    const params: { [key: string]: any } = reactive({})

    const _update = (params: object, url: string) => {        
        const route = queryString.stringifyUrl(
            {
                url: url,
                query: { ...params, 
                    page: undefined },
            },
            {
                arrayFormat: "comma",
            }
        )

        router.visit(route, {
            preserveScroll: true,
            preserveState: true,
        })
    }

    const get = () => queryString.parse(location.search, {
        arrayFormat: "comma",
    })


    const update = () => _update(params, _url)
    
    const set = (key: string, value: any) => params[key] = value  

    const add = (key: string, value: any) => {
        if (Array.isArray(params[key])) {
            params[key].push(value)
        } else {
            params[key] = [value]
        }
    }

    const clear = (key: string) => params[key] = null

    const reset = () => Object.assign(params, get())

    const { pause, resume } = watchPausable(params, update)

    onMounted(async () => {
        if (_auto) {
            pause()
            Object.assign(params, get(), options)
            await nextTick()
            if (_watch) resume()
        }
    })

    return {
        params,
        pause,
        resume,
        reset,
        get,
        set,
        add,
        update,
        clear,
    }
}