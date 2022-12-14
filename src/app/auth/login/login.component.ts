import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import Swal from 'sweetalert2';
import { LoginField } from '../model/login-field.model';
import { LoginToken } from '../model/login.model';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  loginField: typeof LoginField = LoginField;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ) { }

  buildForm(): void {
    this.loginForm = new FormGroup({
      [LoginField.EMAIL]: new FormControl('',
        [
          Validators.required,
          Validators.email
        ]
      ),
      [LoginField.PASSWORD]: new FormControl('',
        [
          Validators.required,
          Validators.minLength(5),
        ]
      )
    })
  }

  ngOnInit(): void {
    this.buildForm();
  }

  onSubmit(): void {
    const payload = this.loginForm.value;
    this.authService.login(payload).subscribe({
      next: (token: LoginToken | null) => {
        if (token) {
          this.handleLogin(token);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Email atau password salah!'
          })
        }
      },
      error: (error) => console.error(error.message)
    })
  }

  private handleLogin(token: LoginToken): void {
    this.activatedRoute.queryParams
      .pipe(map((params) => params['next'] || null))
      .subscribe((next: string = '') => {
        this.router.navigateByUrl(next).finally();
      })
  }

  isValid(loginField: LoginField): string {
    const control: AbstractControl = this.loginForm.get(loginField) as AbstractControl;
    if (control && control.touched && control.invalid) {
      return 'is-invalid';
    } else if (control && control.valid) {
      return 'is-valid';
    } else {
      return '';
    }
  }

}