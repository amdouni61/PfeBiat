import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserProfileComponent } from '../../features/user/user-profile/user-profile.component';
import { UserSettingsComponent } from '../../features/user/user-settings/user-settings.component';
import { MaterialModule } from '../../shared/material.module';


@NgModule({
  declarations: [
    UserProfileComponent,
    UserSettingsComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MaterialModule,
  ]
})
export class UserModule { }
