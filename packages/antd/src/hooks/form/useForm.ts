import React from "react";
import { FormInstance, FormProps, Form } from "antd";
import { useForm as useFormSF } from "sunflower-antd";
import { ButtonProps } from "antd";

import {
    HttpError,
    BaseRecord,
    useForm as useFormCore,
    UseFormReturnType as UseFormReturnTypeCore,
    useWarnAboutChange,
    UseFormProps as UseFormPropsCore,
    CreateResponse,
    UpdateResponse,
    pickNotDeprecated,
} from "@refinedev/core";

export type UseFormProps<
    TQueryFnData extends BaseRecord = BaseRecord,
    TError extends HttpError = HttpError,
    TVariables = {},
    TData extends BaseRecord = TQueryFnData,
    TResponse extends BaseRecord = TData,
    TResponseError extends HttpError = TError,
> = UseFormPropsCore<
    TQueryFnData,
    TError,
    TVariables,
    TData,
    TResponse,
    TResponseError
> & {
    submitOnEnter?: boolean;
    /**
     * Shows notification when unsaved changes exist
     */
    warnWhenUnsavedChanges?: boolean;
};

export type UseFormReturnType<
    TQueryFnData extends BaseRecord = BaseRecord,
    TError extends HttpError = HttpError,
    TVariables = {},
    TData extends BaseRecord = TQueryFnData,
    TResponse extends BaseRecord = TData,
    TResponseError extends HttpError = TError,
> = UseFormReturnTypeCore<
    TQueryFnData,
    TError,
    TVariables,
    TData,
    TResponse,
    TResponseError
> & {
    form: FormInstance<TVariables>;
    formProps: FormProps<TVariables>;
    saveButtonProps: ButtonProps & {
        onClick: () => void;
    };
    onFinish: (
        values?: TVariables,
    ) => Promise<CreateResponse<TResponse> | UpdateResponse<TResponse> | void>;
};

/**
 * `useForm` is used to manage forms. It uses Ant Design {@link https://ant.design/components/form/ Form} data scope management under the hood and returns the required props for managing the form actions.
 *
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/useForm} for more details.
 *
 * @typeParam TData - Result data of the query extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#baserecord `BaseRecord`}
 * @typeParam TError - Custom error object that extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences/#httperror `HttpError`}
 * @typeParam TVariables - Values for params. default `{}`
 * @typeParam TData - Result data returned by the `select` function. Extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#baserecord `BaseRecord`}. Defaults to `TQueryFnData`
 * @typeParam TResponse - Result data returned by the mutation function. Extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#baserecord `BaseRecord`}. Defaults to `TData`
 * @typeParam TResponseError - Custom error object that extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#httperror `HttpError`}. Defaults to `TError`
 *
 *
 */
export const useForm = <
    TQueryFnData extends BaseRecord = BaseRecord,
    TError extends HttpError = HttpError,
    TVariables = {},
    TData extends BaseRecord = TQueryFnData,
    TResponse extends BaseRecord = TData,
    TResponseError extends HttpError = TError,
>({
    action,
    resource,
    onMutationSuccess: onMutationSuccessProp,
    onMutationError,
    submitOnEnter = false,
    warnWhenUnsavedChanges: warnWhenUnsavedChangesProp,
    redirect,
    successNotification,
    errorNotification,
    meta,
    metaData,
    queryMeta,
    mutationMeta,
    liveMode,
    liveParams,
    mutationMode,
    dataProviderName,
    onLiveEvent,
    invalidates,
    undoableTimeout,
    queryOptions,
    createMutationOptions,
    updateMutationOptions,
    id: idFromProps,
    overtimeOptions,
}: UseFormProps<
    TQueryFnData,
    TError,
    TVariables,
    TData,
    TResponse,
    TResponseError
> = {}): UseFormReturnType<
    TQueryFnData,
    TError,
    TVariables,
    TData,
    TResponse,
    TResponseError
> => {
    const [formAnt] = Form.useForm();
    const formSF = useFormSF<TResponse, TVariables>({
        form: formAnt,
    });
    const { form } = formSF;

    const useFormCoreResult = useFormCore<
        TQueryFnData,
        TError,
        TVariables,
        TData,
        TResponse,
        TResponseError
    >({
        onMutationSuccess: onMutationSuccessProp
            ? onMutationSuccessProp
            : undefined,
        onMutationError,
        redirect,
        action,
        resource,
        successNotification,
        errorNotification,
        meta: pickNotDeprecated(meta, metaData),
        metaData: pickNotDeprecated(meta, metaData),
        queryMeta,
        mutationMeta,
        liveMode,
        liveParams,
        mutationMode,
        dataProviderName,
        onLiveEvent,
        invalidates,
        undoableTimeout,
        queryOptions,
        createMutationOptions,
        updateMutationOptions,
        id: idFromProps,
        overtimeOptions,
    });

    const { formLoading, onFinish, queryResult, id } = useFormCoreResult;

    const {
        warnWhenUnsavedChanges: warnWhenUnsavedChangesRefine,
        setWarnWhen,
    } = useWarnAboutChange();
    const warnWhenUnsavedChanges =
        warnWhenUnsavedChangesProp ?? warnWhenUnsavedChangesRefine;

    React.useEffect(() => {
        form.resetFields();
    }, [queryResult?.data?.data, id]);

    const onKeyUp = (event: React.KeyboardEvent<HTMLFormElement>) => {
        if (submitOnEnter && event.key === "Enter") {
            form.submit();
        }
    };

    const onValuesChange = (changeValues: object) => {
        if (changeValues && warnWhenUnsavedChanges) {
            setWarnWhen(true);
        }
        return changeValues;
    };

    const saveButtonProps = {
        disabled: formLoading,
        onClick: () => {
            form.submit();
        },
    };

    return {
        form: formSF.form,
        formProps: {
            ...formSF.formProps,
            onFinish: (values: TVariables) =>
                onFinish(values).catch((error) => error),
            onKeyUp,
            onValuesChange,
            initialValues: queryResult?.data?.data,
        },
        saveButtonProps,
        ...useFormCoreResult,
        onFinish: async (values?: TVariables) => {
            return await onFinish(values ?? formSF.form.getFieldsValue(true));
        },
    };
};
