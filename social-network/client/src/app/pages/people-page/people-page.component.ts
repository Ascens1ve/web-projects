import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { IProfile, IRelationUpdate } from '../../app.constants';
import { SocketService } from '../../services/socket.service';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../services/user.service';
import { ImgUrlPipe } from '../../shared/img-url.pipe';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-people-page',
    imports: [MatInputModule, MatButtonModule, ImgUrlPipe],
    templateUrl: './people-page.component.html',
    styleUrl: './people-page.component.css'
})
export class PeoplePageComponent implements OnInit, OnDestroy {
    private roomName = 'people';
    users: IProfile[] = [];
    filteredUsers: IProfile[] = [];

    constructor(
        private readonly userService: UserService,
        private readonly apiService: ApiService,
        private readonly socketService: SocketService,
        private readonly notificationService: NotificationService,
    ) {}

    ngOnInit(): void {
        const currentUser = this.userService.currentUser;
        if (!currentUser) {
            this.notificationService.show('Пользователь не авторизован', 'error');
            return;
        }
        this.apiService.getUsers().subscribe({
        next: (users: IProfile[]) => {
            this.users = users.map(user => {
            let friendRelation: 'active' | 'outgoing' | 'incoming' | null = null;
            if      (user.friends.active.find(u => u.id === currentUser.id))   friendRelation = 'active'; 
            else if (user.friends.incoming.find(u => u.id === currentUser.id)) friendRelation = 'outgoing';
            else if (user.friends.outgoing.find(u => u.id === currentUser.id)) friendRelation = 'incoming';
            return {
                ...user,
                friendRelation,
            };
            });
            this.filteredUsers = this.users;
        },
        error: (error) => this.notificationService.show(error, 'error'),
        });
        this.socketService.joinRoom(this.roomName);
        this.socketService.onUpdateRelation((data: IRelationUpdate) => this.updateRelation(data));
    }

    ngOnDestroy(): void {
        this.socketService.leaveRoom(this.roomName);
    }

    addFriend(friendId: number) {
        this.socketService.emit('friend-add', friendId);
    }

    deleteFriend(friendId: number) {
        this.socketService.emit('friend-delete', friendId);
    }

    declineFriend(friendId: number, type: 'outgoing' | 'incoming') {
        this.socketService.emit('friend-decline', { friendId, type });
    }

    acceptFriend(friendId: number) {
        this.socketService.emit('friend-accept', friendId);
    }

    getCurrentNickname(): string {
        return this.userService.currentUser?.nickname || '';
    }

    findUsers(value: string) {
        if (!value) {
            this.filteredUsers = this.users;
            return;
        }
        this.filteredUsers = this.users.filter(user => {
            const searchLower = value.toLowerCase();
            return (
            user.name.toLowerCase().includes(searchLower) ||
            user.surname.toLowerCase().includes(searchLower) ||
            user.nickname.toLowerCase().includes(searchLower)
            );
        });
    }

    updateRelation(data: IRelationUpdate): void {
        if (data.type === 'success') {
            const index = this.filteredUsers.findIndex(u => u.id === data.id);
            if (index === -1) return;
            this.filteredUsers[index].friendRelation = data.relation;
        }
    }
}
