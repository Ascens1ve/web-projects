import './BrokersManager.css';
import { Button } from './Button';
import { useState, useRef, useEffect } from 'react';
import Forms from './FormFactory';
import { deleteBroker, getAllBrokers, postBroker } from '../api';
import {
    aliasMaxLength,
    aliasMinLength,
    baseMoneyMaximum,
    baseMoneyMinimum,
    IBroker,
    passwordMaxLength,
    passwordMinLength,
    snMaxLength,
    snMinLength,
    translate,
} from '../interfaces';
import { useLanguage } from '../hooks/useLanguage';
import { useNotification } from '../store/notificationContext';

export default function BrokersManager() {
    const notification = useNotification();
    const language = useLanguage();
    const [brokers, setBrokers] = useState<IBroker[]>([]);
    const [addBroker, setAddBroker] = useState<boolean>(false);
    const addBrokerModal = useRef<HTMLDialogElement | null>(null);

    const openCloseModalHandler = () => {
        if (addBroker && addBrokerModal.current) {
            setAddBroker(false);
            addBrokerModal.current.close();
        } else if (addBrokerModal.current) {
            setAddBroker(true);
            addBrokerModal.current.showModal();
        }
    };

    const addBrokerHandler = async (data: { [key: string]: string }) => {
        try {
            const brokers = await postBroker(data);
            if (brokers) setBrokers([...brokers]);
        } catch (error) {
            notification.showNotification((error as Error).message, 'error');
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
            notification.showNotification((error as Error).message, 'error');
        }
        
    };

    // Получение брокеров с сервера
    useEffect(() => {
        const getBrokers = async () => {
            try {
                const brokers = await getAllBrokers();
                if (brokers) setBrokers([...brokers]);
            } catch (error) {

            }
            
        };
        getBrokers();
    }, []);

    return (
        <div className="brokers">
            <h1 className="brokers__header">Менеджер брокеров</h1>
            <div className="table-wrapper">
                <table className="table">
                    <colgroup>
                        <col style={{ width: '150px' }} />
                        <col style={{ width: '200px' }} />
                        <col style={{ width: '150px' }} />
                        <col style={{ width: '150px' }} />
                        <col style={{ width: '150px' }} />
                    </colgroup>
                    <thead>
                        <tr>
                            <th className="table__cell">Имя</th>
                            <th className="table__cell">Фамилия</th>
                            <th className="table__cell">Псевдоним</th>
                            <th className="table__cell">Начальные средства</th>
                            <th className="table__cell">Действие</th>
                        </tr>
                    </thead>
                    <tbody>
                        {brokers.map((broker, index) => (
                            <tr key={index}>
                                <td className="table__cell">{broker.name}</td>
                                <td className="table__cell">
                                    {broker.surname}
                                </td>
                                <td className="table__cell">{broker.alias}</td>
                                <td className="table__cell">
                                    {broker.baseMoney}
                                </td>
                                <td className="table__cell">
                                    <Button
                                        variant="outlined"
                                        onClick={() => {
                                            deleteBrokerHandler(broker.alias);
                                        }}
                                        color="red"
                                    >
                                        Удалить
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Button variant="outlined" onClick={openCloseModalHandler}>
                Добавить брокера
            </Button>

            <dialog
                onClose={() => setAddBroker(false)}
                ref={addBrokerModal}
                className="add-modal"
            >
                <div>
                    <Forms
                        key={language}
                        elements={[
                            {
                                name: 'name',
                                label: 'Имя',
                                variant: 'standard',
                                options: {
                                    required: translate[language].requiredErrorText,
                                    minLength: {
                                        value: snMinLength,
                                        message: translate[language].snErrorText,
                                    },
                                    maxLength: {
                                        value: snMaxLength,
                                        message: translate[language].snErrorText,
                                    },
                                },
                            },
                            {
                                name: 'surname',
                                label: 'Фамилия',
                                variant: 'standard',
                                options: {
                                    required: translate[language].requiredErrorText,
                                    minLength: {
                                        value: snMinLength,
                                        message: translate[language].snErrorText,
                                    },
                                    maxLength: {
                                        value: snMaxLength,
                                        message: translate[language].snErrorText,
                                    },
                                },
                            },
                            {
                                name: 'alias',
                                label: 'Псевдоним',
                                variant: 'standard',
                                options: {
                                    required: translate[language].requiredErrorText,
                                    minLength: {
                                        value: aliasMinLength,
                                        message: translate[language].aliasErrorText,
                                    },
                                    maxLength: {
                                        value: aliasMaxLength,
                                        message: translate[language].aliasErrorText,
                                    },
                                },
                            },
                            {
                                name: 'password',
                                label: 'Пароль',
                                variant: 'standard',
                                options: {
                                    required: translate[language].requiredErrorText,
                                    minLength: {
                                        value: passwordMinLength,
                                        message: translate[language].passwordErrorText,
                                    },
                                    maxLength: {
                                        value: passwordMaxLength,
                                        message: translate[language].passwordErrorText,
                                    },
                                },
                                type: 'password',
                            },
                            {
                                name: 'baseMoney',
                                label: 'Начальные средства',
                                variant: 'standard',
                                options: {
                                    required: translate[language].requiredErrorText,
                                    min: {
                                        value: baseMoneyMinimum,
                                        message: translate[language].baseMoneyErrorText,
                                    },
                                    max: {
                                        value: baseMoneyMaximum,
                                        message: translate[language].baseMoneyErrorText,
                                    },
                                },
                                type: 'number',
                            },
                        ]}
                        submitButtonText="Добавить"
                        handleSubmit={addBrokerHandler}
                    />
                </div>
            </dialog>
        </div>
    );
}
