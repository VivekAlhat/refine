import { renderHook, waitFor } from "@testing-library/react";

import { TestWrapper } from "@test";

import { useCan } from ".";
import { useCanWithoutCache } from "..";

describe("useCan Hook", () => {
    it("can should return the true ", async () => {
        const { result } = renderHook(
            () =>
                useCan({
                    action: "list",
                    resource: "posts",
                    params: { id: 1 },
                }),
            {
                wrapper: TestWrapper({
                    accessControlProvider: {
                        can: ({ resource, action, params }) => {
                            if (
                                action === "list" &&
                                resource === "posts" &&
                                params?.id === 1
                            ) {
                                return Promise.resolve({
                                    can: true,
                                    reason: "Access granted",
                                });
                            }
                            return Promise.resolve({ can: false });
                        },
                    },
                }),
            },
        );

        await waitFor(() => {
            expect(result.current?.isFetched).toBeTruthy();
        });

        expect(result.current?.data?.can).toBeTruthy();
        expect(result.current?.data?.reason).toBe("Access granted");
    });

    it("can should return the false ", async () => {
        const { result } = renderHook(
            () =>
                useCan({
                    action: "list",
                    resource: "posts",
                    params: { id: 10 },
                }),
            {
                wrapper: TestWrapper({
                    accessControlProvider: {
                        can: ({ resource, action, params }) => {
                            if (
                                action === "list" &&
                                resource === "posts" &&
                                params?.id === 1
                            ) {
                                return Promise.resolve({
                                    can: true,
                                    reason: "Access granted",
                                });
                            }
                            return Promise.resolve({
                                can: false,
                                reason: "Access Denied",
                            });
                        },
                    },
                }),
            },
        );

        await waitFor(() => {
            expect(result.current?.isFetched).toBeTruthy();
        });

        expect(result.current?.data?.can).toBeFalsy();
        expect(result.current?.data?.reason).toBe("Access Denied");
    });

    it("can should return the true if can is undefined ", async () => {
        const { result } = renderHook(
            () =>
                useCan({
                    action: "list",
                    resource: "posts",
                    params: { id: 1 },
                }),
            {
                wrapper: TestWrapper({
                    accessControlProvider: {
                        can: undefined,
                    },
                }),
            },
        );

        expect(result.current).toEqual({ data: { can: true } });
    });

    it("can should sanitize resource icon ", async () => {
        const mockFn = jest.fn();
        renderHook(
            () =>
                useCan({
                    action: "list",
                    resource: "posts",
                    params: {
                        id: 1,
                        resource: { icon: "test", name: "posts" } as any,
                    },
                }),
            {
                wrapper: TestWrapper({
                    accessControlProvider: {
                        can: mockFn,
                    },
                }),
            },
        );

        expect(mockFn).toBeCalledWith({
            action: "list",
            params: {
                id: 1,
                resource: { name: "posts" },
            },
            resource: "posts",
        });
    });

    it("should be disable by queryOptions", async () => {
        const mockFn = jest.fn();
        renderHook(
            () =>
                useCan({
                    action: "list",
                    resource: "posts",
                    params: { id: 1 },
                    queryOptions: {
                        enabled: false,
                    },
                }),
            {
                wrapper: TestWrapper({
                    accessControlProvider: {
                        can: mockFn,
                    },
                }),
            },
        );

        expect(mockFn).not.toBeCalled();
    });

    it("should not throw error when accessControlProvider is undefined", async () => {
        const { result } = renderHook(
            () =>
                useCan({
                    action: "list",
                    resource: "posts",
                }),
            {
                wrapper: TestWrapper({}),
            },
        );

        await waitFor(() => {
            expect(result.current.data).toEqual({ can: true });
        });
    });
});

describe("useCanWithoutCache", () => {
    it("should return the can function from the AccessControlContext", () => {
        const canMock = jest.fn();

        const { result } = renderHook(() => useCanWithoutCache(), {
            wrapper: TestWrapper({
                accessControlProvider: {
                    can: canMock,
                },
            }),
        });

        expect(result.current).toEqual({ can: canMock });
    });
});
