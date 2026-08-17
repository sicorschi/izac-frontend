import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MatCardModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './not-found.html',
  styleUrls: ['./not-found.css'],
})
export class NotFoundComponent {}
