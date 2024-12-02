"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import useSWR from 'swr';

interface PermissionContextType {
    permission: boolean;
    error: any;
    isLoading: boolean;
    checkPermission: () => void;
}

const fetcher = async (url: string) => {
    const res = await fetch(url, { method: "GET", credentials: "include" });
    return res.json();
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const usePermission = (): PermissionContextType => {
    const context = useContext(PermissionContext);
    if (!context) {
        throw new Error('usePermission must be used within a PermissionProvider');
    }
    return context;
};

interface PermissionProviderProps {
    children: ReactNode;
}

export const PermissionProvider = ({ children }: PermissionProviderProps): JSX.Element => {
    const { data, error, isLoading } = useSWR('http://localhost:3001/user/profile', fetcher,{
        revalidateOnFocus: false, // Disable re-fetching when the window is refocused
        revalidateOnReconnect: false, // Disable re-fetching on network reconnect
        shouldRetryOnError: false, // Disable retrying on error
    });
    const [permission, setPermission] = useState<boolean>(false);

    // 手動觸發資料請求並更新 permission
    const checkPermission = () => {
        if (data) {
            // 如果成功獲取資料，將資料儲存到 localStorage 並更新 permission
           //localStorage.setItem('user', JSON.stringify(data));
            setPermission(true);
        } else {
            // 沒有獲取資料，設置 permission 為 false
            setPermission(false);
        }
    };

    return (
        <PermissionContext.Provider value={{ permission, error, isLoading: isLoading, checkPermission}}>
            {children}
        </PermissionContext.Provider>
    );
};
