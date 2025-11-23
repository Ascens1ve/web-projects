export const baseURL = 'http://localhost:3000';
export const eventsUrl = 'http://localhost:3001/events';

export const passwordMaxLength = 32;
export const passwordMinLength = 8;
export const aliasMaxLength = 48;
export const aliasMinLength = 4;
export const snMinLength = 1;
export const snMaxLength = 60;
export const baseMoneyMinimum = 10;
export const baseMoneyMaximum = 1000000;

export const unknownError =
  'Непредвиденная ошибка, пожалуйста обновите страницу!';
export const requiredErrorText = 'Заполните это поле!';
export const passwordErrorText = `Пароль должен быть от ${passwordMinLength} до ${passwordMaxLength} символов`;
export const aliasErrorText = `Псевдоним должен быть от ${aliasMinLength} до ${aliasMaxLength} символов`;
export const snErrorText = `Поле не должно превышать ${snMaxLength} символов`;
export const baseMoneyErrorText = `Значение не находится в диапазоне от ${baseMoneyMinimum} до ${baseMoneyMaximum}`;
export const mustBeNonNegative = 'Значение должно быть не отрицательным';
export const mustBePositive = 'Значение должно быть положительным';
export const chooseCompaniesFirst = 'Необходимо выбрать компании';
export const setSpeed = 'Введите скорость торгов';
export const formError = 'Форма содержит ошибки';
