import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { IAuth, IUser } from '../interfaces';
import { fetchUser, loginByAlias } from '../api';

export interface UserState {
  user: IUser | null;
  isLoading: boolean;
  isAuthChecked: boolean;
  isAuthenticated: boolean;
  error: string;
  language: 'ru' | 'en';
}

export const login = createAsyncThunk<
  IAuth,
  { alias: string; password: string },
  { rejectValue: string }
>('user/login', async (data, thunkAPI) => {
  try {
    return await loginByAlias(data.alias, data.password);
  } catch (error) {
    return thunkAPI.rejectWithValue(
      `Ошибка при входе: ${(error as Error).message}`,
    );
  }
});

export const getUser = createAsyncThunk<IUser, void, { rejectValue: string }>(
  'user/get',
  async (_, thunkAPI) => {
    try {
      return await fetchUser();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        `Ошибка при получении данных пользователя: ${(error as Error).message}`,
      );
    }
  },
);

export const checkUserAuth = createAsyncThunk(
  'user/checkAuth',
  async (_, thunkAPI) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) thunkAPI.dispatch(authChecked());
    else {
      thunkAPI.dispatch(getUser());
      thunkAPI.dispatch(authChecked());
    }
  },
);

const initialState: UserState = {
  user: null,
  isLoading: false,
  isAuthChecked: false,
  isAuthenticated: false,
  error: '',
  language: 'ru',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    authChecked(state: UserState) {
      state.isAuthChecked = true;
    },
    changeLang(state: UserState) {
      if (state.language === 'ru') state.language = 'en';
      else state.language = 'ru';
    },
    logout(state: UserState) {
      localStorage.removeItem('accessToken');
      state.user = null;
      state.isLoading = false;
      state.isAuthChecked = true;
      state.isAuthenticated = false;
    },
    clearError(state: UserState) {
      state.error = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state: UserState) => {
        state.isLoading = true;
      })
      .addCase(login.rejected, (state: UserState, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Ошибка при входе';
        state.isAuthChecked = true;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(
        login.fulfilled,
        (state: UserState, action: PayloadAction<IAuth>) => {
          state.isLoading = false;
          state.error = '';
          state.user = {
            name: action.payload.name,
            surname: action.payload.surname,
            alias: action.payload.alias,
          };
          state.isAuthChecked = true;
          state.isAuthenticated = true;
          localStorage.setItem('accessToken', action.payload.token);
        },
      )
      .addCase(getUser.pending, (state: UserState) => {
        state.isLoading = true;
      })
      .addCase(getUser.rejected, (state: UserState, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Ошибка получения данных пользователя';
        state.isAuthChecked = true;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(
        getUser.fulfilled,
        (state: UserState, action: PayloadAction<IUser>) => {
          state.isLoading = false;
          state.error = '';
          state.isAuthChecked = true;
          state.isAuthenticated = true;
          state.user = action.payload;
        },
      );
  },
});

export const { authChecked, changeLang, logout, clearError } =
  userSlice.actions;
export const userReducer = userSlice.reducer;
