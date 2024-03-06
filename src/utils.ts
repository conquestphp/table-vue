import { usePage } from '@inertiajs/vue3';

export const getPageProps = (key: string) => {

    const keys = key.split('.');
    let result: any = usePage().props;

    for (const key of keys) {
        result = result[key];
    }

    return result;
}

export const emptyValue = (value: any) => value === '' || value === null || value === undefined || value?.length === 0


