import { JSX } from 'react';
import {
  ChangeHandler,
  FieldError,
  RefCallBack,
  RegisterOptions,
  useForm,
} from 'react-hook-form';
import { TextField, Button } from '@mui/material';
import styles from './FormFactory.module.css';

interface FormElement {
  name: string;
  label: string;
  variant?: 'outlined' | 'filled' | 'standard';
  type?: 'password' | 'text' | 'email' | 'hidden' | 'number';
  options?: RegisterOptions;
  ref?: React.RefObject<HTMLInputElement | null>;
}

interface restType {
  onChange: ChangeHandler;
  onBlur: ChangeHandler;
  name: string;
  min?: string | number;
  max?: string | number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  required?: boolean;
  disabled?: boolean;
}

interface FormProps {
  handleSubmit: (
    data: { [key: string]: string },
    event?: React.BaseSyntheticEvent,
  ) => void | Promise<void>;
  elements: FormElement[];
  submitButtonText: string;
  formStyle?: { [key: string]: string };
  resetButtonText?: string;
}

export default function Forms({
  handleSubmit,
  elements,
  submitButtonText,
  formStyle,
  resetButtonText,
}: FormProps): JSX.Element {
  const {
    register,
    handleSubmit: submitFunction,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (
    data: { [key: string]: string },
    event?: React.BaseSyntheticEvent,
  ) => {
    try {
      await handleSubmit(data, event);
      reset();
    } catch (error) {
      console.error('Ошибка в handleSubmit:', error);
    }
  };

  const data: Array<[RefCallBack, restType]> = [];
  for (const element of elements) {
    const { ref, ...rest } = register(element.name, element.options);
    data.push([ref, rest]);
  }
  return (
    <form
      onSubmit={submitFunction(onSubmit)}
      className={styles.form}
      style={formStyle}
    >
      {elements.map((element, index) => (
        <TextField
          key={index}
          label={element.label}
          inputRef={data[index][0]}
          {...data[index][1]}
          error={!!errors[element.name]}
          helperText={
            (errors[element.name] as FieldError | undefined)?.message || ' '
          }
          variant={element.variant}
          type={element.type}
          ref={element.ref}
        />
      ))}
      <Button variant='contained' type='submit' color='primary'>
        {submitButtonText}
      </Button>
      {resetButtonText && (
        <Button variant='outlined' onClick={() => reset()}>
          {resetButtonText}
        </Button>
      )}
    </form>
  );
}
