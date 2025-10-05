import { Header } from '../components/Header';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { PickerValue } from '@mui/x-date-pickers/internals';
import {
    useSelector,
    useDispatch,
    selectIsSending,
    selectStocksDates,
    selectBidState,
    selectBidSpeed,
    selectStartDate,
} from '../store/store';
import { useEffect, useRef, useState } from 'react';
import {
    BidState,
    getStartEndDates,
    sendPause,
    sendResume,
    sendStart,
    sendStop,
    setBidSpeed,
    setBidState,
    setStartDate,
} from '../store/stocksSlice';
import dayjs, { Dayjs } from 'dayjs';
import './ImitationPage.css';
import { useLanguage } from '../hooks/useLanguage';
import { eventsUrl, IResponse, IStocks, StocksCompanies, translate } from '../interfaces';
import { io, Socket } from 'socket.io-client';
import { parseDollar } from '../helper';
import { useForm, Controller } from 'react-hook-form';
import { Alert, Button, TextField } from '@mui/material';
import { show } from '../store/notificationSlice';

interface IData {
    speed: number | undefined;
    date: string | undefined;
    prices: Partial<Record<StocksCompanies, number>>;
}

type FormValues = {
    startDate: Dayjs | null;
    speed: number | null;
}

export const ImitationPage = () => {
    const dispatch = useDispatch();
    const language = useLanguage();
    const t = translate[language];
    
    const isSending = useSelector(selectIsSending);
    const dates = useSelector(selectStocksDates);
    const [data, setData] = useState<IData>({speed: undefined, date: undefined, prices: {}})
    const bidSpeed = useSelector(selectBidSpeed);
    const bidState = useSelector(selectBidState);
    const startDate = useSelector(selectStartDate);
    const choosedCompanies = useSelector((state) => state.stocks.choosedCompanies);

    const { control, register, setValue, setError, clearErrors, formState: { errors }, trigger} = useForm<FormValues>({
        defaultValues: { startDate: null }
    });

    useEffect(() => {
        if (startDate) {
            setValue("startDate", dayjs(startDate));
        }
        else if (dates?.min) {
            handleStartDateChange(dayjs(dates.min));
            setValue("startDate", dayjs(dates.min));
        }
    }, [dates?.min, setValue]);

    useEffect(() => {
        if (choosedCompanies?.length) clearErrors("root");
    }, [choosedCompanies, clearErrors]);

    const URL = eventsUrl;
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const socket = io(URL, {
            autoConnect: true,
            auth: { token: localStorage.getItem('accessToken') },
            query: { page: window.location.pathname },
        });
        socketRef.current = socket;

        socket.on('connected', (
            body: {
                speed: number,
                date: string,
                state: BidState,
                prices: Partial<Record<StocksCompanies, number>>
            }) => {
                setData({speed: body.speed, date: body.date, prices: body.prices});
                dispatch(setBidState(body.state));
        });

        socket.on('update', (body: {currentDate: string, stocks: Partial<Record<StocksCompanies, IStocks>>}) => {
            const newPrices: Partial<Record<StocksCompanies, number>> = {};
            for (const company in body.stocks) {
                newPrices[company as StocksCompanies] = parseDollar(body.stocks[company as StocksCompanies]!.Open);
            } 
            setData(prevData => ({
                ...prevData,
                date: body.currentDate,
                prices: newPrices
            }));
        });

        socket.on('pause', (body: IResponse) => {
            if (body.success) {
                dispatch(setBidState(BidState.pause));
                dispatch(show({ message: 'Торги приостановлены', type: 'warn' }));
            }
        })

        socket.on('resume', (body: IResponse) => {
            if (body.success) {
                dispatch(setBidState(BidState.running));
                dispatch(show({ message: 'Торги возобновлены', type: 'warn' }));
            }
        })

        socket.on('end', (body: IResponse) => {
            if (body.success) {
                dispatch(setBidState(BidState.stop));
                dispatch(show({ message: 'Торги закончены', type: 'warn' }));
            }
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [dispatch]);

    const isSocketConnected = () => !!socketRef.current && socketRef.current.connected;

    const handleStartDateChange = (value: PickerValue) => {
        if (value) {
            dispatch(setStartDate(`${value.month() + 1}/${value.date()}/${value.year()}`));
        }
    };

    const handleStart = async () => {
        if (!choosedCompanies || choosedCompanies.length === 0) {
            setError('root', {
                type: 'manual',
                message: t.chooseCompaniesFirst,
            });
            return;
        }
        const isValid = await trigger();
        if (!isValid) {
            setError('root', {
                type: 'manual',
                message: t.formError,
            });
            return;
        }
        clearErrors('root');
        const result = await dispatch(sendStart());
        if (result.meta.requestStatus === 'fulfilled') {
            if (!isSocketConnected() && socketRef.current) {
                socketRef.current.connect();
            }
        }
    }

    const handlePause = () => dispatch(sendPause());
    const handleResume = () => dispatch(sendResume());

    const handleStop = async () => {
        const result = await dispatch(sendStop());
        if (result.meta.requestStatus === 'fulfilled') {
            if (isSocketConnected() && socketRef.current)
                socketRef.current.disconnect();
        }
    }

    useEffect(() => {
        if (!dates) dispatch(getStartEndDates());
    }, []);

    if (isSending) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Header />
            <div className="imitation">
                <div className='imitation__flex'>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <form className='imitation__form'>
                            <h1>Дата начала торгов:</h1>
                            <Controller
                                name='startDate'
                                control={control}
                                rules={{
                                    required: t.requiredErrorText,
                                    validate: (v) => {
                                        if (!v) return true;
                                        const min = dates?.min ? dayjs(dates.min) : undefined;
                                        const max = dates?.max ? dayjs(dates.max).subtract(10, 'day') : undefined;
                                        if (min && v.isBefore(min, 'day')) return 'Дата раньше допустимой';
                                        if (max && v.isAfter(max, 'day')) return 'Дата позже допустимой';
                                        return true;
                                    }
                                }}
                                render={({field, fieldState}) => (
                                    <DatePicker
                                        label='Дата начала торгов'
                                        value={field.value}
                                        onChange={(newValue) => {
                                            field.onChange(newValue);
                                            handleStartDateChange?.(newValue);
                                        }}
                                        minDate={dates?.min ? dayjs(dates.min) : undefined}
                                        maxDate={dates?.max ? dayjs(dates.max).subtract(10, 'day') : undefined}
                                        slotProps={{
                                            textField: {
                                                error: !!fieldState.error,
                                                helperText: fieldState.error?.message,
                                                readOnly: true,
                                            }
                                        }}
                                    />
                                )}
                            />

                            <TextField
                                label='Скорость в секундах'
                                variant='standard'
                                type='number'
                                value={bidSpeed ?? 5}
                                sx={{ mt: 2 }}
                                {...register('speed', {
                                    required: t.requiredErrorText,
                                    setValueAs: (v) => (v === '' || v == null ? null : Number(v)),
                                    validate: (v) => v == null || v >= 0 || t.mustBeNonNegative || t.mustBePositive,
                                })}
                                onChange={(newValue) => {dispatch(setBidSpeed(Number(newValue.target.value)))}}
                                error={!!errors.speed}
                                helperText={errors.speed?.message}
                                inputProps={{ inputMode: 'numeric', step: 1, min: 0 }}
                            />
                            
                            {errors.root && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {errors.root.message}
                            </Alert>
                            )}
                        </form>
                    </LocalizationProvider>
                    {bidState !== BidState.stop && (
                        <div className="imitation__info">
                            <h2 className="info__text info__text_bold">Информация:</h2>
                            <h3 className="info__text">Скорость: {data.speed ? `${data.speed} с` : 'не задана'}</h3>
                            <h3 className="info__text">Текущая дата: {data.date}</h3>
                            <h3 className="info__text info__text_bold">Стоимости акций:</h3>
                            <table className="price">
                                <thead>
                                    <tr>
                                        <th className="price__cell">Компания</th>
                                        <th className="price__cell">Стоимость</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(data.prices).map(([company, price]) => (
                                        <tr key={`${company}-${price}`}>
                                            <td className="price__cell">{company}</td>
                                            <td className="price__cell">{price.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <div className="startdiv">
                    {bidState === BidState.stop
                        ? <Button className="state-button" variant="outlined" onClick={handleStart}>Начать торги</Button>    
                        : bidState === BidState.running
                            ? <div className="state-buttons">
                                <Button className="state-button" variant="outlined" onClick={handlePause}>Приостановить торги</Button>
                                <Button className="state-button" variant="outlined" onClick={handleStop}>Остановить торги</Button>
                              </div>
                            : <div className="state-buttons">
                                <Button className="state-button" variant="outlined" onClick={handleResume}>Возобновить торги</Button>
                                <Button className="state-button" variant="outlined" onClick={handleStop}>Остановить торги</Button>
                              </div>
                    }
                </div>
            </div>
        </>
    );
};
