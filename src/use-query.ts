import { watchPausable } from "@vueuse/core"
import queryString from "query-string"
import { router } from "@inertiajs/vue3"

import { reactive } from "vue"

export interface UseQueryProps {
    _url: string,
}

export const useQuery = (props: any) => {
    const {
        _url = location.origin + location.pathname,
        ...options
    } = props

    const params = reactive({...options})

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

    const update = () => {
        _update(params, _url)
    }

    const { pause, resume } = watchPausable(params, update)

    const set = (key: string, value: any) => {
        params[key] = value
    }

    const clear = (key: string) => {
        params[key] = undefined
    }

    return {
        params,
        pause,
        resume,
        update,
        set,
        clear
    }



}