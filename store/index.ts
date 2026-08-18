import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import authReducer from "./slices/authSlice";
import pendingTransactionReducer from "./slices/pendingTransactionSlice"; // VULN-004

export const store = configureStore({
    reducer: {
        auth: authReducer,
        pendingTransaction: pendingTransactionReducer, // VULN-004
        [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;