import { watchPausable } from "@vueuse/core"
import queryString from "query-string"
import { router } from "@inertiajs/vue3"

import { onMounted, reactive, nextTick } from "vue"

export interface UseQueryProps {
    _url?: string;
    _watch?: boolean;
    [key: string]: any;
}

export const useQuery = (props?: UseQueryProps) => {
    const {
        _url = location.origin + location.pathname,
        _watch = true,
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

    const clear = (key: string) => params[key] = undefined

    const reset = () => Object.assign(params, get())

    const { pause, resume } = watchPausable(params, update)

    onMounted(async () => {
        pause()
        Object.assign(params, get(), options)
        await nextTick()
        if (_watch) resume()
    })

    return {
        params,
        pause,
        resume,
        update,
        set,
        clear,
        get,
        reset,
    }
}