import { computed, reactive } from "vue";
import type { Actions, BulkAction, InlineAction, PageAction, RouterOptions } from "./types";
import { router } from "@inertiajs/vue3";

export const useActions = (actions: Actions) => {
    return {
        inline: computed(() => actions.inline),
            // actions.inline.map((action: InlineAction) => ({
            //     ...action
            // }))
        // }),
        bulk: computed(() => actions.bulk),
        //     actions.bulk.map((action: BulkAction) => ({
        //         ...action
        //     }))
        // }),
        page: computed(() => {
            actions.page.map((action: PageAction) => ({
                ...action,
                exec: (data: object, options: RouterOptions) => {
                    if (action.endpoint === null) return 

                    if (action.endpoint.method === 'delete') {
                        router.delete(action.endpoint.route, {
                            ...options
                        })
                        return
                    }

                    router[action.endpoint.method](action.endpoint.route, {
                        ...data,
                    }, {
                        ...options
                    })
                }
            }))
        }),
    }
}
