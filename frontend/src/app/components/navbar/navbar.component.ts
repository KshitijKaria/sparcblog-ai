import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark" style="background-color: #1a2332;">
      <div class="container-fluid">
        <a class="navbar-brand fw-bold" routerLink="/">
          <span style="color: #28a745;">Sparc</span>Blog AI
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <a class="nav-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Dashboard</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/news" routerLinkActive="active">News Feed</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/drafts" routerLinkActive="active">Drafts</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/sources" routerLinkActive="active">Sources</a>
            </li>
          </ul>
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/blog" routerLinkActive="active">
                <span style="color: #28a745;">View Blog</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {}
