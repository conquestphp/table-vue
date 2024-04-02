import { usePage } from '@inertiajs/vue3';

export const getProp = (key: string, props?: object) => {

    const keys = key.split('.');
    let result: any = props || usePage().props;

    for (const key of keys) {
        result = result[key];
    }
    return result;
}    

export const emptyValue = (value: any) => value === '' || value === null || value === undefined || value?.length === 0