import axios from "axios"
import * as SecureStore from 'expo-secure-store'

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_ID_KEY = "userId";

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_BASE_URL,
    headers:{
        'Accept': 'application/json'
    }
})

export const storeTokens = async(
    accessToken: string,
    refreshToken: string
) => {
    await SecureStore.setItemAsync("accessToken", accessToken);
    await SecureStore.setItemAsync("refreshToken", refreshToken);
}

export const storeUserId = async(userId: string) => {
    await SecureStore.setItemAsync(USER_ID_KEY, userId);
}

export const getAccessToken = async () => {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export const getRefreshToken = async () => {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
};


export const getUserId = async () => {
    return await SecureStore.getItemAsync(USER_ID_KEY);
};

export const clearTokens = async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_ID_KEY);
};

export const refreshTokens = async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
        throw new Error("No refresh token available");
    }

    try {
        const response = await api.post("/refresh-token", { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        await storeTokens(accessToken, newRefreshToken);
        return accessToken;
    } catch (error) {
        await clearTokens();
        throw error;
    }
};

api.interceptors.request.use(
    async (config) => {
        const token = await getAccessToken();
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry &&
            !originalRequest.url.includes('test-login') && !originalRequest.url.includes('refresh-token')) {
            originalRequest._retry = true;
            try {
                const accessToken = await refreshTokens();
                api.defaults.headers.common["Authorization"] =
                    "Bearer " + accessToken;
                return api(originalRequest);
            } catch (refreshError) {
                //TODO: Handle refresh token failure ( logout user)
                return Promise.reject(refreshError);
                
            }
        }
        return Promise.reject(error);
    }
);

export default api;