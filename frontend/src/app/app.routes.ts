import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NewsFeedComponent } from './components/news-feed/news-feed.component';
import { DraftListComponent } from './components/draft-list/draft-list.component';
import { DraftEditorComponent } from './components/draft-editor/draft-editor.component';
import { SourceManagerComponent } from './components/source-manager/source-manager.component';
import { BlogListComponent } from './components/blog-list/blog-list.component';
import { BlogPostComponent } from './components/blog-post/blog-post.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'news', component: NewsFeedComponent },
  { path: 'drafts', component: DraftListComponent },
  { path: 'drafts/:id', component: DraftEditorComponent },
  { path: 'sources', component: SourceManagerComponent },
  { path: 'blog', component: BlogListComponent },
  { path: 'blog/:slug', component: BlogPostComponent },
  { path: '**', redirectTo: '' }
];
