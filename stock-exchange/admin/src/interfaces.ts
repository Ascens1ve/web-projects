export interface FormProps {
    buttonsWidth?: string;
    buttonsHeight?: string;
    inputsWidth?: string;
    inputsHeight?: string;
    fontSize?: string;
}

export interface IUser {
    name: string;
    surname: string;
    alias: string;
}

export interface IBroker {
    name: string;
    surname: string;
    alias: string;
    baseMoney: string;
    password: string;
}

export interface IStocks {
    Date: string;
    Open: string;
}

export enum StocksCompanies {
    AAPL = 'AAPL',
    AMD = 'AMD',
    AMZN = 'AMZN',
    CSCO = 'CSCO',
    SBUX = 'SBUX',
    META = 'META',
    MSFT = 'MSFT',
    TSLA = 'TSLA',
    QCOM = 'QCOM',
    NFLX = 'NFLX',
}

export interface IStart {
    currentDate: string;
    bidSpeed: number;
    choosedCompanies: StocksCompanies[];
}

export interface IResponse {
    success: boolean;
    message: string;
}

export interface IAuth {
    token: string;
    name: string;
    surname: string;
    alias: string;
}

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

export const translate = {
    ru: {
        requiredErrorText: 'Заполните это поле!',
        passwordErrorText: `Пароль должен быть от ${passwordMinLength} до ${passwordMaxLength} символов`,
        aliasErrorText: `Псевдоним должен быть от ${aliasMinLength} до ${aliasMaxLength} символов`,
        snErrorText: `Поле не должно превышать ${snMaxLength} символов`,
        baseMoneyErrorText: `Значение не находится в диапазоне от ${baseMoneyMinimum} до ${baseMoneyMaximum}`,
        mustBeNonNegative: 'Значение должно быть не отрицательным',
        mustBePositive: 'Значение должно быть положительным',
        chooseCompaniesFirst: 'Необходимо выбрать компании',
        setSpeed: 'Введите скорость торгов',
        formError: 'Форма содержит ошибки',
    },
    en: {
        requiredErrorText: 'Please fill this field!',
        passwordErrorText: 'Password must be between ${passwordMinLength} and ${passwordMaxLength} characters',
        aliasErrorText: `The alias must be between ${aliasMinLength} and ${aliasMaxLength} characters`,
        snErrorText: `Field must not exceed ${snMaxLength} characters`,
        baseMoneyErrorText: `Value is not between ${baseMoneyMinimum} and ${baseMoneyMaximum}`,
        mustBeNonNegative: 'Value mustn\'t be negative',
        mustBePositive: 'Value must be positive',
        chooseCompaniesFirst: 'It is necessary to select companies',
        setSpeed: 'Fill the speed of bids',
        formError: 'Form has errors',
    }
};
