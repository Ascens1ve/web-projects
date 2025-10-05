import { combineReducers, configureStore, } from '@reduxjs/toolkit';
import { userReducer } from './userSlice';
import {
    TypedUseSelectorHook,
    useDispatch as dispatchHook,
    useSelector as selectorHook,
} from 'react-redux';
import { stocksReducer } from './stocksSlice';
import { StocksCompanies } from '../interfaces';
import { notificationReducer } from './notificationSlice';

export const rootReducer = combineReducers({
    user: userReducer,
    stocks: stocksReducer,
    notification: notificationReducer,
});

const store = configureStore({
    reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export const useDispatch = () => dispatchHook<AppDispatch>();
export const useSelector: TypedUseSelectorHook<RootState> = selectorHook;

// User
export const selectUserLoading = (state: RootState) => state.user.isLoading;
export const selectIsAuthChecked = (state: RootState) =>
    state.user.isAuthChecked;
export const selectIsAuthenticated = (state: RootState) =>
    state.user.isAuthenticated;
export const selectUser = (state: RootState) => state.user.user;

// Stocks
export const selectStocksByName = (name: StocksCompanies) =>
    (state: RootState) => state.stocks[name];
export const selectChoosedCompanies = (state: RootState) =>
    state.stocks.choosedCompanies;
export const selectIsSending = (state: RootState) => state.stocks.isSending;
export const selectStocksDates = (state: RootState) => state.stocks.dates;
export const selectBidState = (state: RootState) => state.stocks.bidState;
export const selectBidSpeed = (state: RootState) => state.stocks.bidSpeed;
export const selectStartDate = (state: RootState) => state.stocks.startDate;

export default store;
