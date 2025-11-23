import styles from './BrokersPage.module.css';
import { Button } from '../components/Button';
import { useState, useEffect } from 'react';
import { deleteBroker, getAllBrokers, postBroker } from '../api';
import { IBroker } from '../interfaces';
import { useDispatch } from '../store/store';
import { show } from '../store/notificationSlice';
import { Modal } from '../components/Modal';
import { MoneyEditor } from '../components/MoneyEditor';
import { AddBrokerForm } from '../components/AddBrokerForm';
import { unknownError } from '../constants';

export const BrokersPage = () => {
  const dispatch = useDispatch();
  const [brokers, setBrokers] = useState<IBroker[]>([]);
  const [addBroker, setAddBroker] = useState<boolean>(false);
  const [editBroker, setEditBroker] = useState<boolean>(false);
  const [editedBroker, setEditedBroker] = useState<IBroker | null>(null);

  const handleEditBroker = (broker: IBroker) => {
    setEditedBroker({ ...broker });
    setEditBroker(true);
  };

  const onSuccessEditBroker = async () => {
    const brokers = await getAllBrokers();
    if (brokers) setBrokers([...brokers]);
  };

  const addBrokerHandler = async (data: { [key: string]: string }) => {
    try {
      const brokers = await postBroker(data);
      if (brokers) setBrokers([...brokers]);
    } catch (error) {
      dispatch(show({ message: (error as Error).message, type: 'error' }));
    }
  };

  const deleteBrokerHandler = async (alias: string) => {
    try {
      if (await deleteBroker(alias)) {
        const brokerIndex = brokers.findIndex((br) => br.alias === alias);
        brokers.splice(brokerIndex, 1);
        setBrokers([...brokers]);
      }
    } catch (error) {
      dispatch(show({ message: (error as Error).message, type: 'error' }));
    }
  };

  // Получение брокеров с сервера
  useEffect(() => {
    const getBrokers = async () => {
      try {
        const brokers = await getAllBrokers();
        if (brokers) setBrokers([...brokers]);
      } catch (error) {
        dispatch(show({ message: unknownError, type: 'error' }));
      }
    };
    getBrokers();
  }, []);

  return (
    <div className={styles.brokers}>
      <h1 className={styles.brokers__header}>Менеджер брокеров</h1>
      <div className={styles.table__wrapper}>
        <table className={styles.table}>
          <colgroup>
            <col style={{ width: '150px' }} />
            <col style={{ width: '200px' }} />
            <col style={{ width: '150px' }} />
            <col style={{ width: '150px' }} />
            <col style={{ width: '150px' }} />
          </colgroup>
          <thead>
            <tr>
              <th className={styles.table__cell}>Имя</th>
              <th className={styles.table__cell}>Фамилия</th>
              <th className={styles.table__cell}>Псевдоним</th>
              <th className={styles.table__cell}>Начальные средства</th>
              <th className={styles.table__cell}>Действие</th>
            </tr>
          </thead>
          <tbody>
            {brokers.map((broker, index) => (
              <tr key={index}>
                <td className={styles.table__cell}>{broker.name}</td>
                <td className={styles.table__cell}>{broker.surname}</td>
                <td className={styles.table__cell}>{broker.alias}</td>
                <td className={styles.table__cell}>
                  <div className={styles.table__money}>
                    {broker.baseMoney}
                    <button onClick={() => handleEditBroker(broker)}>
                      Edit
                    </button>
                  </div>
                </td>
                <td className={styles.table__cell}>
                  <Button
                    variant='outlined'
                    onClick={() => {
                      deleteBrokerHandler(broker.alias);
                    }}
                    color='red'
                  >
                    Удалить
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant='outlined' onClick={() => setAddBroker(true)}>
        Добавить брокера
      </Button>
      {addBroker && (
        <Modal onClose={() => setAddBroker(false)}>
          <AddBrokerForm onSubmit={addBrokerHandler} />
        </Modal>
      )}
      {editBroker && (
        <Modal onClose={() => setEditBroker(false)}>
          <MoneyEditor broker={editedBroker} onSuccess={onSuccessEditBroker} />
        </Modal>
      )}
    </div>
  );
};
