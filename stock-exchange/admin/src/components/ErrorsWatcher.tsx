import { useEffect } from 'react';
import { RootState, useDispatch, useSelector } from '../store/store';
import { clearError as clearErrorUser } from '../store/userSlice';
import { clearError as clearErrorStocks } from '../store/stocksSlice';
import { show } from '../store/notificationSlice';

export const ErrorWatcher = () => {
  const dispatch = useDispatch();
  const stocksError = useSelector((state: RootState) => state.stocks.error);
  const userError = useSelector((state: RootState) => state.user.error);

  useEffect(() => {
    if (!stocksError) return;
    dispatch(show({ message: stocksError, type: 'error' }));
    dispatch(clearErrorStocks());
  }, [stocksError, dispatch]);

  useEffect(() => {
    if (!userError) return;
    dispatch(show({ message: userError, type: 'error' }));
    dispatch(clearErrorUser());
  }, [userError, dispatch]);

  return null;
};
