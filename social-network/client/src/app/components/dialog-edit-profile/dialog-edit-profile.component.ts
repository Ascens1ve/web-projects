import { Component } from '@angular/core';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from "@angular/material/input";
import { UserService } from '../../services/user.service';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { IEditProfileResponse } from '../../app.constants';
import { atLeastOne, isImage } from '../../shared/helper';

@Component({
  selector: 'app-dialog-edit-profile',
  imports: [MatButtonModule, MatDialogModule, MatInputModule, MatFormFieldModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dialog-edit-profile.component.html',
  styleUrls: ['./dialog-edit-profile.component.css']
})
export class DialogEditProfileComponent {
  form: FormGroup;

  constructor(
    private readonly userService: UserService,
    private readonly apiService: ApiService,
    private readonly notificationService: NotificationService,
  ) {
    this.form = new FormGroup({
      name: new FormControl(
        this.userService.currentUser?.name ?? '',
        [Validators.required, Validators.minLength(1), Validators.maxLength(48)]
      ),
      surname: new FormControl(
        this.userService.currentUser?.surname ?? '',
        [Validators.required, Validators.minLength(1), Validators.maxLength(48)]
      ),
      about: new FormControl(
        this.userService.currentUser?.about ?? '',
        [Validators.maxLength(255)]
      ),
      avatar: new FormControl<File | null>(null, [isImage()])
    }, { validators: atLeastOne(['name', 'surname', 'about', 'avatar'])});
  }

  onFileSelected(event: any) {
    const file = event.target.files[0] ?? null;
    this.form.get('avatar')!.setValue(file);
    this.form.get('avatar')!.markAsTouched();
    this.form.get('avatar')!.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const formData = new FormData();
    formData.append('info', JSON.stringify({
      name: this.form.value.name,
      surname: this.form.value.surname,
      about: this.form.value.about,
    }));
    formData.append('avatar', this.form.value.avatar);
    this.apiService.postEditProfile(formData).subscribe({
      next: (response: IEditProfileResponse) => {
        this.userService.currentUser = {
          ...this.userService.currentUser!,
            name: response.name,
            surname: response.surname,
            about: response.about,
            avatar: response.avatar
        };
        this.notificationService.show('Профиль успешно изменён', 'success');
      },
      error: (error) => {
        this.notificationService.show(error.error.error, 'error');
      }
    });
  }

  get nameError(): string {
    const control = this.form.get('name');
    if (!control) return '';
    if (control.hasError('required')) return 'Имя обязательно';
    if (control.hasError('minlength')) return 'Минимум 1 символ';
    if (control.hasError('maxlength')) return 'Максимум 48 символов';
    return '';
  }

  get surnameError() {
    const control = this.form.get('surname');
    if (!control) return '';
    if (control.hasError('required')) return 'Фамилия обязательна';
    if (control.hasError('minlength')) return 'Минимум 1 символ';
    if (control.hasError('maxlength')) return 'Максимум 48 символов';
    return '';
  }

  get aboutError(): string {
    const control = this.form.get('about');
    if (!control) return '';
    if (control.hasError('maxlength')) return 'Текст слишком длинный';
    return '';
  }

  get avatarError(): string {
    const control = this.form.get('avatar');
    if (!control) return '';
    if (control.hasError('imageType')) return 'Выберите картинку';
    return '';
  }

  get currentAvatar(): string | null {
    console.log(this.userService.currentUser?.avatar);
    return this.userService.currentUser?.avatar ?? null;
  }

  removeImage(fileInput: HTMLInputElement) {
    this.form.get('avatar')!.setValue(null);
    this.form.get('avatar')!.markAsPristine();
    fileInput.value = '';
  }

  removeInitialAvatar() {
    this.apiService.deleteAvatar().subscribe({
      next: (user) => {
        this.userService.currentUser = {
          ...this.userService.currentUser!,
          avatar: user.avatar,
        }
        this.notificationService.show('Аватарка удалена', 'success');
      },
      error: (error) => this.notificationService.show(error.error.error, 'error'),
    })
  }
}
