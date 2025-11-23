import {
  aliasErrorText,
  aliasMaxLength,
  aliasMinLength,
  baseMoneyErrorText,
  baseMoneyMaximum,
  baseMoneyMinimum,
  passwordErrorText,
  passwordMaxLength,
  passwordMinLength,
  requiredErrorText,
  snErrorText,
  snMaxLength,
  snMinLength,
} from '../constants';
import Forms from './FormFactory';
import styles from './AddBrokerForm.module.css';

interface AddBrokerFormProps {
  onSubmit: (data: any) => void;
}

export const AddBrokerForm = ({ onSubmit }: AddBrokerFormProps) => (
  <div className={styles.back}>
    <Forms
      elements={[
        {
          name: 'name',
          label: 'Имя',
          variant: 'standard',
          options: {
            required: requiredErrorText,
            minLength: {
              value: snMinLength,
              message: snErrorText,
            },
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
            minLength: {
              value: snMinLength,
              message: snErrorText,
            },
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
          type: 'password',
        },
        {
          name: 'baseMoney',
          label: 'Начальные средства',
          variant: 'standard',
          options: {
            required: requiredErrorText,
            min: {
              value: baseMoneyMinimum,
              message: baseMoneyErrorText,
            },
            max: {
              value: baseMoneyMaximum,
              message: baseMoneyErrorText,
            },
          },
          type: 'number',
        },
      ]}
      submitButtonText='Добавить'
      handleSubmit={onSubmit}
    />
  </div>
);
