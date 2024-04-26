import { configureStore } from "@reduxjs/toolkit";
import userReducer from '../features/UserAuth/userSlice';
import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';
import { combineReducers } from '@reduxjs/toolkit';

const persistConfig = {
    key: 'root',
    storage,
}

const reducers = combineReducers({
    user: userReducer
});

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
    reducer: {
        user: persistedReducer // Pass the persisted reducer
    }
});