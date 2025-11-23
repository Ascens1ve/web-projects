import Forms from '../components/FormFactory';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import styles from './wrapper.module.css';
import { useDispatch } from '../store/store';
import { login } from '../store/userSlice';
import {
  aliasErrorText,
  aliasMaxLength,
  aliasMinLength,
  passwordErrorText,
  passwordMaxLength,
  passwordMinLength,
  requiredErrorText,
} from '../constants';

export const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
      <section className={styles.form__section}>
        <div className={styles.form__wrapper}>
          <Forms
            handleSubmit={handleSubmit}
            submitButtonText='Войти'
            elements={[
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
                type: 'password',
              },
            ]}
          />
        </div>
      </section>
    </>
  );
};
