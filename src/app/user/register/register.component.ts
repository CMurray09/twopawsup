import { Component } from '@angular/core';
import {FormGroup, FormControl, Validators} from "@angular/forms";
import { AuthService } from "src/app/services/auth.service";
import IUser from "src/app/models/user.model";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  showAlert: boolean = false;
  alertMsg: string = 'Please wait! Your account is being created.';
  alertColour: string = 'blue';
  inSubmission: boolean = false;

  constructor(private auth: AuthService){}

  registerForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3)
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    age: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(18),
      Validators.max(150)
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$')
    ]),
    confirm_password: new FormControl('', [
      Validators.required
    ]),
    phoneNumber: new FormControl('', [
      Validators.required,
      Validators.minLength(12),
      Validators.maxLength(12)
    ])
  });

  async register() {
    this.inSubmission = true;
    this.showAlert = true;
    this.alertMsg = 'Please wait! Your account is being created.';
    this.alertColour = 'blue';

    try {
      await this.auth.createUser(this.registerForm.value as IUser)
    } catch(e) {
      console.error(e);
      this.alertMsg = 'An unexpected error occurred. Please try again later.';
      this.alertColour = 'red';
      this.inSubmission = false;
      return;
    }
    this.alertMsg = 'Success! Your account has been created.';
    this.alertColour = 'green';
    this.inSubmission = false;
  }
}
