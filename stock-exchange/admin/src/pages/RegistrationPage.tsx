import Forms from '../components/FormFactory';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import './wrapper.css';

const requiredErrorText = 'Заполните это поле!';
const passwordMaxLength = 32;
const passwordMinLength = 8;
const passwordErrorText = `Пароль должен быть от ${passwordMinLength} до ${passwordMaxLength} символов`;
const aliasMaxLength = 48;
const aliasMinLength = 4;
const aliasErrorText = `Псевдоним должен быть от ${aliasMinLength} до ${aliasMaxLength} символов`;
const snMaxLength = 60;
const snErrorText = `Поле не должно превышать ${snMaxLength} символов`;

export const RegistrationPage = () => {
    const navigate = useNavigate();
    const handleSubmit = (data: { [key: string]: string }) => {
        fetch('http://localhost:3000/registration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }).then((result) => {
            if (result.ok) {
                navigate('/');
            }
        });
    };

    return (
        <>
            <Header />
            <div className="form-wrapper">
                <Forms
                    handleSubmit={handleSubmit}
                    submitButtonText="Зарегистрироваться"
                    elements={[
                        {
                            name: 'name',
                            label: 'Имя',
                            variant: 'standard',
                            options: {
                                required: requiredErrorText,
                                maxLength: {
                                    value: snMaxLength,
                                    message: snErrorText,
                                },
                            },
                        },
                        {
                            name: 'surname',
                            label: 'Фамилия',
                            variant: 'standard',
                            options: {
                                required: requiredErrorText,
                                maxLength: {
                                    value: snMaxLength,
                                    message: snErrorText,
                                },
                            },
                        },
                        {
                            name: 'alias',
                            label: 'Псевдоним',
                            variant: 'standard',
                            options: {
                                required: requiredErrorText,
                                minLength: {
                                    value: aliasMinLength,
                                    message: aliasErrorText,
                                },
                                maxLength: {
                                    value: aliasMaxLength,
                                    message: aliasErrorText,
                                },
                            },
                        },
                        {
                            name: 'password',
                            label: 'Пароль',
                            variant: 'standard',
                            options: {
                                required: requiredErrorText,
                                minLength: {
                                    value: passwordMinLength,
                                    message: passwordErrorText,
                                },
                                maxLength: {
                                    value: passwordMaxLength,
                                    message: passwordErrorText,
                                },
                            },
                        },
                    ]}
                />
            </div>
        </>
    );
};
