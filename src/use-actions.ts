import { computed } from "vue";
import type { Actions, UseActions, PageAction, ActionablePageAction } from "./types";
import { router } from "@inertiajs/vue3";

export const useActions = (actions: Actions): UseActions => {
    return {
        inline: computed(() => actions.inline),
        bulk: computed(() => actions.bulk),
        page: computed(() => actions.page.map((action: PageAction): ActionablePageAction => ({
            ...action,
            exec: (data, options) => {
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
        }))),
    }
}
