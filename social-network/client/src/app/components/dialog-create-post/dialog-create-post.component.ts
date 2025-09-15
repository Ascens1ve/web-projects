import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { atLeastOne, isImage } from '../../shared/helper';

@Component({
  selector: 'app-dialog-create-post',
  imports: [MatButtonModule, MatDialogModule, MatInputModule, MatFormFieldModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dialog-create-post.component.html',
  styleUrl: './dialog-create-post.component.css'
})
export class DialogCreatePostComponent {
  form: FormGroup;

  constructor(
    private readonly apiService: ApiService,
    private readonly notificationService: NotificationService,
  ) {
    this.form = new FormGroup({
      text: new FormControl<string>('', [Validators.maxLength(255)]),
      image: new FormControl<File | null>(null, [isImage()])
    }, { validators: atLeastOne(['text', 'image']) });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0] ?? null;
    this.form.get('image')!.setValue(file);
    this.form.get('image')!.markAsTouched();
    this.form.get('image')!.updateValueAndValidity();
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const formData = new FormData();
    formData.append('text', this.form.value.text);
    formData.append('image', this.form.value.image);
    this.apiService.postNewPost(formData).subscribe({
      error: (error) => this.notificationService.show(error, 'error'),
    });
  }

  get textError() {
    const control = this.form.get('text');
    if (!control) return '';
    if (control.hasError('maxlength')) return 'Превышена маскимальная длина';
    return '';
  }

  get imageError() {
    const control = this.form.get('image');
    if (!control) return '';
    if (control.hasError('imageType')) return 'Пожалуйста, выберите картинку';
    return '';
  }

  removeImage(fileInput: HTMLInputElement) {
    this.form.get('image')!.setValue(null);
    this.form.get('image')!.markAsPristine();
    fileInput.value = '';
  }
}
