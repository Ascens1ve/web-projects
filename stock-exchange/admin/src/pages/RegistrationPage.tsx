import Forms from '../components/FormFactory';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import styles from './wrapper.module.css';
import {
  aliasErrorText,
  aliasMaxLength,
  aliasMinLength,
  baseURL,
  passwordErrorText,
  passwordMaxLength,
  passwordMinLength,
  requiredErrorText,
  snErrorText,
  snMaxLength,
  snMinLength,
} from '../constants';

export const RegistrationPage = () => {
  const navigate = useNavigate();
  const handleSubmit = (data: { [key: string]: string }) => {
    fetch(`${baseURL}/registration`, {
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
      <div className={styles.form__wrapper}>
        <Forms
          handleSubmit={handleSubmit}
          submitButtonText='Зарегистрироваться'
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
                minLength: {
                  value: snMinLength,
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
                minLength: {
                  value: snMinLength,
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
