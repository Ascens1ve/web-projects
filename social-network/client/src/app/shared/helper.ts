import { AbstractControl, ValidatorFn } from "@angular/forms";
import { baseUrl } from "../app.constants";

export function connectLinks(link: string): string {
  return `${baseUrl}/${link}`;
}

export function isImage(): ValidatorFn {
  return (control: AbstractControl) => {
    const file = control.value as File | null;
    if (!file) return null;
    return file.type?.startsWith('image/') ? null : { imageType: true };
  };
}

export function atLeastOne(keys: string[]): ValidatorFn {
  return (group: AbstractControl) => {
    const hasAny = keys.some(k => {
      const v = group.get(k)?.value;
      if (v instanceof File) return true;
      if (typeof v === 'string') return v.trim().length > 0;
      return !!v;
    });
    return hasAny ? null : { atLeastOne: true };
  };
}

export function isBirthday(): ValidatorFn {
  return (control: AbstractControl) => {
    const value = control.value;
    if (!value) return null;

    const birthday = new Date(value);
    const today = new Date();

    if (birthday > today) return { incorrectDate: true };

    const age = today.getFullYear() - birthday.getFullYear();

    if (age > 125) return { incorrectDate: true };

    const isBeforeBirthday =
      today.getMonth() < birthday.getMonth() ||
      (today.getMonth() === birthday.getMonth() && today.getDate() < birthday.getDate());

    if (age < 14 || (age === 14 && isBeforeBirthday)) return { tooYoung: true };
    return null;
  };
}
