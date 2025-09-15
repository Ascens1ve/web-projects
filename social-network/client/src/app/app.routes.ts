import { Routes } from '@angular/router';
import { ROUTES_CONSTANTS } from './app.constants';
import { AuthGuard } from './shared/auth.guard';
import { PeoplePageComponent } from './pages/people-page/people-page.component';
import { FeedPageComponent } from './pages/feed-page/feed-page.component';
import { RegistrationPageComponent } from './pages/registration-page/registration-page.component';
import { AuthPageComponent } from './pages/auth-page/auth-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { FriendsPageComponent } from './pages/friends-page/friends-page.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page';

export const routes: Routes = [
    { path: ROUTES_CONSTANTS.USERS.path, component: PeoplePageComponent, canActivate: [AuthGuard] },
    { path: ROUTES_CONSTANTS.FEED.path, component:  FeedPageComponent, canActivate: [AuthGuard] },
    { path: `${ROUTES_CONSTANTS.PROFILE.path}/:nickname`, component: ProfilePageComponent, canActivate: [AuthGuard] },
    { path: `${ROUTES_CONSTANTS.FRIENDS.path}/:nickname`, component:  FriendsPageComponent, canActivate: [AuthGuard]},
    { path: ROUTES_CONSTANTS.REGISTRATION.path, component: RegistrationPageComponent, canActivate: [AuthGuard] },
    { path: ROUTES_CONSTANTS.LOGIN.path, component: AuthPageComponent, canActivate: [AuthGuard] },
    { path: '**', component: NotFoundPageComponent, canActivate: [AuthGuard] }
];
