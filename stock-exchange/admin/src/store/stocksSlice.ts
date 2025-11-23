import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { IStocks, StocksCompanies } from '../interfaces';
import {
  fetchStocks,
  getMinMaxDates,
  sendChoosedCompanies,
  setPause,
  setResume,
  setStart,
  setStop,
} from '../api';

export enum BidState {
  stop = 0,
  running = 1,
  pause = 2,
}

export type StocksState = {
  [K in StocksCompanies]: IStocks[];
} & {
  isLoading: boolean;
  isSending: boolean;
  error: string;
  loadedCompanies: StocksCompanies[];
  choosedCompanies: StocksCompanies[];
  dates: { min: number; max: number } | null;
  bidSpeed: number | null;
  startDate: string | null;
  bidState: BidState;
};

export interface IRStocks {
  stocks: IStocks[];
  name: string;
}

const initialState: StocksState = Object.assign(
  {
    isLoading: false,
    error: '',
    loadedCompanies: [],
    choosedCompanies: [],
    isSending: false,
    dates: null,
    bidSpeed: 5,
    startDate: null,
    bidState: BidState.stop,
  },
  ...Object.values(StocksCompanies).map((company) => ({
    [company]: [],
  })),
);

export const getStocksByName = createAsyncThunk<
  IRStocks,
  string,
  { rejectValue: string; state: { stocks: StocksState } }
>('stocks/get', async (name: string, thunkAPI) => {
  const { loadedCompanies } = thunkAPI.getState().stocks;
  if (loadedCompanies.includes(name as StocksCompanies)) {
    return thunkAPI.rejectWithValue('Data already loaded');
  }
  try {
    const response = await fetchStocks(name);
    return { stocks: response, name } as IRStocks;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      `Ошибка при получении акций ${name}: ${(error as Error).message}`,
    );
  }
});

export const postChoosedCompanies = createAsyncThunk<
  number,
  void,
  { rejectValue: string; state: { stocks: StocksState } }
>('stocks/send-companies', async (_, thunkAPI) => {
  const { choosedCompanies } = thunkAPI.getState().stocks;
  if (choosedCompanies.length === 0)
    return thunkAPI.rejectWithValue('Некорректные компании');
  try {
    await sendChoosedCompanies(choosedCompanies);
    return 0;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      `Ошибка при загрузке выбранных компаний: ${(error as Error).message}`,
    );
  }
});

export const getStartEndDates = createAsyncThunk<
  { min: string; max: string },
  void,
  { rejectValue: string }
>('stocks/get-dates', async (_, thunkAPI) => {
  try {
    return await getMinMaxDates();
  } catch (error) {
    return thunkAPI.rejectWithValue(
      `Ошибка при получении начальной и конечной даты торгов: ${(error as Error).message}`,
    );
  }
});

export const sendStart = createAsyncThunk<
  string,
  void,
  { state: { stocks: StocksState }; rejectValue: string }
>('stocks/send-start', async (_, thunkAPI) => {
  const { bidSpeed, choosedCompanies, startDate } = thunkAPI.getState().stocks;
  if (!startDate || !bidSpeed)
    return thunkAPI.rejectWithValue('Ошибка при старте торгов');
  try {
    return await setStart({
      currentDate: startDate,
      bidSpeed,
      choosedCompanies,
    });
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message);
  }
});

export const sendPause = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>('stocks/send-pause', async (_, thunkAPI) => {
  try {
    return await setPause();
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message);
  }
});

export const sendResume = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>('stocks/send-resume', async (_, thunkAPI) => {
  try {
    return await setResume();
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message);
  }
});

export const sendStop = createAsyncThunk<string, void, { rejectValue: string }>(
  'stocks/send-stop',
  async (_, thunkAPI) => {
    try {
      return await setStop();
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  },
);

export const stocksSlice = createSlice({
  name: 'stocks',
  initialState,
  reducers: {
    chooseCompanies(
      state: StocksState,
      action: PayloadAction<StocksCompanies[]>,
    ) {
      if (
        action.payload.every((comp) =>
          Object.values(StocksCompanies).includes(comp),
        )
      ) {
        state.error = '';
        state.choosedCompanies = action.payload;
      } else {
        state.error = 'Неверное название компании';
      }
    },
    removeCompanies(state: StocksState) {
      state.error = '';
      state.choosedCompanies = [];
    },
    // THINK: Возможно здесь тоже стоит сделать проверку
    setBidSpeed(state: StocksState, action: PayloadAction<number>) {
      state.bidSpeed = action.payload;
    },
    // THINK: Возможно здесь тоже стоит сделать проверку
    setStartDate(state: StocksState, action: PayloadAction<string>) {
      state.startDate = action.payload;
    },
    setBidState(state: StocksState, action: PayloadAction<BidState>) {
      state.bidState = action.payload;
    },
    clearError(state: StocksState) {
      state.error = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStocksByName.pending, (state: StocksState) => {
        state.isLoading = true;
        state.error = '';
      })
      .addCase(getStocksByName.rejected, (state: StocksState, action) => {
        state.isLoading = false;
        state.error = action.payload
          ? action.payload === 'Data already loaded'
            ? ''
            : action.payload
          : 'Ошибка при получении акций';
      })
      .addCase(
        getStocksByName.fulfilled,
        (state: StocksState, action: PayloadAction<IRStocks>) => {
          state.isLoading = false;
          if (
            Object.values(StocksCompanies).includes(
              action.payload.name as StocksCompanies,
            )
          ) {
            state.error = '';
            state.loadedCompanies.push(action.payload.name as StocksCompanies);
            state[action.payload.name as StocksCompanies] =
              action.payload.stocks;
          } else {
            state.error = 'Invalid company name';
          }
        },
      )
      .addCase(postChoosedCompanies.pending, (state: StocksState) => {
        state.isSending = true;
      })
      .addCase(postChoosedCompanies.rejected, (state: StocksState, action) => {
        state.isSending = false;
        state.error =
          action.payload ?? 'Ошибка при загрузке выбранных компаний';
      })
      .addCase(postChoosedCompanies.fulfilled, (state: StocksState) => {
        state.isSending = false;
        state.error = '';
      })
      .addCase(getStartEndDates.pending, (state: StocksState) => {
        state.isSending = true;
        state.error = '';
      })
      .addCase(getStartEndDates.rejected, (state: StocksState, action) => {
        state.isSending = false;
        state.error =
          action.payload ??
          'Ошибка при получении начальной и конечной даты торгов';
      })
      .addCase(
        getStartEndDates.fulfilled,
        (
          state: StocksState,
          action: PayloadAction<{ min: string; max: string }>,
        ) => {
          state.isSending = false;
          state.error = '';
          state.dates = {
            min: Date.parse(action.payload.min),
            max: Date.parse(action.payload.max),
          };
        },
      )
      .addCase(sendStart.rejected, (state: StocksState, action) => {
        state.error = action.payload ?? 'Ошибка при старте торгов';
      })
      .addCase(sendStart.fulfilled, (state: StocksState) => {
        state.error = '';
        state.bidState = BidState.running;
      })
      .addCase(sendPause.rejected, (state: StocksState, action) => {
        state.error = action.payload ?? 'Ошибка при приостановлении торгов';
      })
      .addCase(sendPause.fulfilled, (state: StocksState) => {
        state.error = '';
        state.bidState = BidState.pause;
      })
      .addCase(sendResume.rejected, (state: StocksState, action) => {
        state.error = action.payload ?? 'Ошибка при возобновлении торгов';
      })
      .addCase(sendResume.fulfilled, (state: StocksState) => {
        state.error = '';
        state.bidState = BidState.running;
      })
      .addCase(sendStop.rejected, (state: StocksState, action) => {
        state.error = action.payload ?? 'Ошибка при остановке торгов';
      })
      .addCase(sendStop.fulfilled, (state: StocksState) => {
        state.error = '';
        state.bidState = BidState.stop;
      });
  },
});

export const stocksReducer = stocksSlice.reducer;
export const {
  chooseCompanies,
  removeCompanies,
  setBidSpeed,
  setStartDate,
  setBidState,
  clearError,
} = stocksSlice.actions;
