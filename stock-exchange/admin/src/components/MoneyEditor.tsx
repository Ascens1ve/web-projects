import { SyntheticEvent, useEffect, useState } from 'react';
import { IBroker, IResponse } from '../interfaces';
import styles from './MoneyEditor.module.css';
import { useSocket } from '../hooks/useSocket';
import { useDispatch } from '../store/store';
import { show } from '../store/notificationSlice';
import { eventsUrl } from '../constants';

interface MoneyEditorProps {
  broker: IBroker | null;
  onSuccess: () => void;
}

export const MoneyEditor = ({ broker, onSuccess }: MoneyEditorProps) => {
  const dispatch = useDispatch();
  const [balance, setBalance] = useState<number>(Number(broker?.baseMoney));

  const handleReset = () => {
    setBalance(Number(broker?.baseMoney));
  };

  const socketRef = useSocket(eventsUrl, {});

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    if (balance !== Number(broker?.baseMoney)) {
      socketRef.current?.emit(
        'edit-basemoney',
        { alias: broker?.alias, baseMoney: balance },
        (body: IResponse) => {
          dispatch(
            show({
              message: body.message,
              type: body.success ? 'success' : 'error',
            }),
          );
          if (body.success) {
            onSuccess();
          }
        },
      );
    }
  };

  useEffect(() => {
    if (!socketRef.current?.connected) socketRef.current?.connect();
  }, []);

  if (!broker) {
    return <div>Брокер не найден.</div>;
  }

  return (
    <div className={styles.editor}>
      <h2 className={styles.editor__title}>
        {broker.name} {broker.surname}
      </h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.form__element}>
          <label className={styles.form__label} htmlFor='balance'>
            Начальный баланс:
          </label>
          <input
            className={styles.form__input}
            value={balance}
            onChange={(event) => setBalance(Number(event.target.value))}
            name='balance'
            type='number'
            min='100'
            max='100000'
          />
        </div>
        <div className={styles.form__buttons}>
          <button className={styles.form__button} type='submit'>
            Изменить
          </button>
          <button
            className={styles.form__button}
            type='button'
            onClick={handleReset}
          >
            Вернуть исходный
          </button>
        </div>
      </form>
    </div>
  );
};
