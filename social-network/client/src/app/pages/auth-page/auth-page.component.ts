import { Component } from '@angular/core';
import { FormsModule, Validators, FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import {
  IUser,
  maxNicknameLength,
  maxPasswordLength,
  minNicknameLength,
  minPasswordLength,
  nicknameError,
  passwordError,
  requiredError,
  ROUTES_CONSTANTS
} from '../../app.constants';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../services/user.service';
import { SocketService } from '../../services/socket.service';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-auth-page',
  imports: [MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css'
})
export class AuthPageComponent {
  form: FormGroup;
  isSubmitting: boolean = false;

  constructor(
    private userService: UserService,
    private readonly authService: AuthService,
    private readonly socketService: SocketService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
  ) {
    this.form = new FormGroup({
      nickname: new FormControl<string>(
        '',
        [Validators.required, Validators.minLength(minNicknameLength), Validators.maxLength(maxNicknameLength)]
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
    this.authService.login(this.form.value).subscribe({
      next: (response: IUser) => {
        this.userService.currentUser = response;
        localStorage.setItem('authToken', response.token);
        this.router.navigateByUrl(ROUTES_CONSTANTS.FEED.path);
        this.socketService.connect(response.token);
        this.socketService.joinRoom(response.nickname);
        this.isSubmitting = false;
      },
      error: () => {
        this.notificationService.show('Ошибка при входе', 'error');
        this.isSubmitting = false;
      },
    });
  }

  toRegistration() {
    this.router.navigateByUrl('/registration');
  }

  get nicknameError() {
    const control = this.form.get('nickname');
    if (!control) return '';
    if (control.hasError('required')) return requiredError;
    if (control.hasError('minlength') || control.hasError('maxlength')) return nicknameError;
    return '';
  }

  get passwordError() {
    const control = this.form.get('password');
    if (!control) return '';
    if (control.hasError('required')) return requiredError;
    if (control.hasError('minlength') || control.hasError('maxlength')) return passwordError;
    return '';
  }
}
