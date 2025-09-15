import Forms from '../components/FormFactory';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import './wrapper.css';
import { useDispatch } from '../store/store';
import { login } from '../store/userSlice';
import { useLanguage } from '../hooks/useLanguage';
import { aliasMaxLength, aliasMinLength, passwordMaxLength, passwordMinLength, translate } from '../interfaces';

export const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const language = useLanguage();

    const handleSubmit = async (data: { [key: string]: string }) => {
        const resultAction = await dispatch(
            login({ alias: data.alias, password: data.password }),
        );
        if (resultAction.meta.requestStatus === 'fulfilled') {
            navigate('/');
        }
    };

    return (
        <>
            <Header />
            <section className="form-section">
                <div className="form-wrapper">
                    <Forms
                        handleSubmit={handleSubmit}
                        submitButtonText="Войти"
                        elements={[
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
                        ]}
                    />
                </div>
            </section>
        </>
    );
};
