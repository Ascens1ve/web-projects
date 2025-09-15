import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  emailError,
  futurePastDateError,
  IUser,
  maxNameSurnameLength,
  maxNicknameLength,
  maxPasswordLength,
  minNameSurnameLength,
  minNicknameLength,
  minPasswordLength,
  nameSurnameError,
  nicknameError,
  passwordError,
  requiredError,
  ROUTES_CONSTANTS,
  tooYoungError
} from '../../app.constants';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { isBirthday } from '../../shared/helper';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-registration-page',
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './registration-page.component.html',
  styleUrl: './registration-page.component.css'
})
export class RegistrationPageComponent {
  form: FormGroup;
  isSubmitting: boolean = false;
  
  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private userService: UserService,
    private readonly notificationService: NotificationService,
  ) {
    this.form = new FormGroup({
      nickname: new FormControl<string>(
        '',
        [Validators.required, Validators.minLength(minNicknameLength), Validators.maxLength(maxNicknameLength)]
      ),
      name: new FormControl<string>(
        '',
        [Validators.required, Validators.minLength(minNameSurnameLength), Validators.maxLength(maxNameSurnameLength)]
      ),
      surname: new FormControl<string>(
        '',
        [Validators.required, Validators.minLength(minNameSurnameLength), Validators.maxLength(maxNameSurnameLength)]
      ),
      birthday: new FormControl<Date | null>(
        null,
        [Validators.required, isBirthday()]
      ),
      email: new FormControl<string>(
        '',
        [Validators.required, Validators.email]
      ),
      password: new FormControl<string>(
        '',
        [Validators.required, Validators.minLength(minPasswordLength), Validators.maxLength(maxPasswordLength)]
      )
    });
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.isSubmitting = true;
    this.authService.registration(this.form.value).subscribe({
      next: (response: IUser) => {
        this.userService.currentUser = response;
        localStorage.setItem('authToken', response.token);
        this.router.navigateByUrl(ROUTES_CONSTANTS.FEED.path);
        this.isSubmitting = false;
      },
      error: () => {
        this.notificationService.show('Ошибка регистрации', 'error')
        this.isSubmitting = false;
      },
    });
  }

  toLogin() {
    this.router.navigateByUrl('/login');
  }

  get nicknameError() {
    const control = this.form.get('nickname');
    if (!control) return '';
    if (control.hasError('required')) return requiredError;
    if (control.hasError('minlength') || control.hasError('maxlength')) return nicknameError;
    return '';
  }

  get nameError() {
    const control = this.form.get('name');
    if (!control) return '';
    if (control.hasError('required')) return requiredError;
    if (control.hasError('minlength') || control.hasError('maxlength')) return nameSurnameError;
    return '';
  }

  get surnameError() {
    const control = this.form.get('surname');
    if (!control) return '';
    if (control.hasError('required')) return requiredError;
    if (control.hasError('minlength') || control.hasError('maxlength')) return nameSurnameError;
    return '';
  }

  get passwordError() {
    const control = this.form.get('password');
    if (!control) return '';
    if (control.hasError('required')) return requiredError;
    if (control.hasError('minlength') || control.hasError('maxlength')) return passwordError;
    return '';
  }

  get birthdayError() {
    const control = this.form.get('birthday');
    if (!control) return '';
    if (control.hasError('required')) return requiredError;
    if (control.hasError('incorrectDate')) return futurePastDateError;
    if (control.hasError('tooYoung')) return tooYoungError;
    return '';
  }

  get emailError() {
    const control = this.form.get('email');
    if (!control) return '';
    if (control.hasError('required')) return requiredError;
    if (control.hasError('email')) return emailError;
    return '';
  }
}
