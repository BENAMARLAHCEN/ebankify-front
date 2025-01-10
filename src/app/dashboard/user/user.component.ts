import { Component } from '@angular/core';
import { LogoutComponent } from "../../shared/components/logout/logout.component";

@Component({
  selector: 'app-user',
  imports: [LogoutComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {

}
