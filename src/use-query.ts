import { watchPausable } from "@vueuse/core"
import queryString from "query-string"
import { router } from "@inertiajs/vue3"
import { onMounted, reactive, nextTick } from "vue"
import { emptyValue } from "./utils"
import type { UseQueryProps, UseQuery } from "./types"

export const useQuery = (props: UseQueryProps = {}): UseQuery => {
    const {
        _url = location.href,
        _watch = true,
        _auto = true,
        _only = [],
        transforms = {},
        ...options
    } = props

    const params: { [key: string]: any } = reactive({})

    const urlParams = () => {
        let transformed: { [key: string]: any } = {}
        for (const key in params) {
            if (key in transforms) transformed[key] = transforms[key](params[key])
            else if (emptyValue(params[key])) continue
            else transformed[key] = params[key]
        }
        return transformed
    }

    const _update = (params: object, url: string) => {
        const route = queryString.stringifyUrl(
            {
                url: url,
                query: { ...params, page: undefined },
            },
            {
                arrayFormat: "comma",
            }
        )

        router.visit(route, {
            only: _only,
            preserveScroll: true,
            preserveState: true,
        })
    }

    const get = () => queryString.parse(location.search, {
        arrayFormat: "comma",
    })

    const update = () => _update(urlParams(), _url)
    
    const set = (key: string, value: any) => params[key] = value  

    const add = (key: string, value: any) => {
        if (Array.isArray(params[key])) params[key].push(value)
        else params[key] = [value]
    }

    const clear = (key: string) => params[key] = null

    const reset = () => Object.assign(params, get())

    const { pause, resume } = watchPausable(params, update)

    onMounted(() => {
        if (_auto) {
            pause()
            Object.assign(params, get(), options)
            nextTick(() => {
                if (_watch) resume()
            })
        }
    })

    return {
        params,
        urlParams,
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