import { Server } from 'socket.io';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import DataWatcher from '../data.js';
import path from 'path';

let io;
const jwtSecret = fs.readFileSync(path.join(process.cwd(), '/sslcert/private.key'));

function checkFriendsRelation(user, friend, relation) {
    switch (relation) {
        case 'unfamiliar':
            for (const key in user.friends) {
                if (user.friends[key].find(id => id === friend.id)) return false;
            }
            return true;
        case 'invited':
            if (user.friends['active'].find(id => id === friend.id)) return false;
            if (user.friends['incoming'].find(id => id === friend.id)) return false;
            return true;
        case 'familiar':
            if (user.friends['outgoing'].find(id => id === friend.id)) return false;
            if (user.friends['incoming'].find(id => id === friend.id)) return false;
            return true;
    }
}

function omit(key, obj) {
    const { [key]: omitted, ...rest } = obj;
    return rest;
}

export function initSocket(server) {
    io = new Server(server, {
        cors: {
          origin: 'http://localhost:4200',
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          credentials: true
        }
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('no token'));
        try {
            const payload = jwt.verify(token, jwtSecret);
            socket.data.user = payload;
            socket.data.id = payload.id;
            return next();
        } catch (error) {
            return next(new Error('unauthorized'));
        }
    });

    io.on('connection', (socket) => {
        socket.on('joinRoom', (room) => {
            socket.join(room);
        });
    
        socket.on('leaveRoom', (room) => {
            socket.leave(room);
        });

        socket.on('friend-add', async (friendID) => {
            console.log(`Event: friend-add, id: ${friendID}, my-id: ${socket.data.id}`);
            const userIndex = DataWatcher.users.findIndex(u => u.id === socket.data.id);
            const friendIndex = DataWatcher.users.findIndex(u => u.id === friendID);
            console.log(`UserIndex = ${userIndex}, FriendIndex = ${friendIndex}`);
            if (userIndex === -1 || friendIndex === -1) {
                console.log('Not found');
                socket.emit('error', {
                    type: 'error', message: 'Ошибка при поиске пользователя'
                });
                return;
            }

            try {
                const updatedUser = structuredClone(DataWatcher.users[userIndex]);
                const updatedFriend = structuredClone(DataWatcher.users[friendIndex]);

                if (!checkFriendsRelation(updatedUser, updatedFriend, 'unfamiliar')) {
                    console.log('Check relation');
                    socket.emit('error', {
                        type: 'error', message: 'Неверный запрос'
                    });
                    return;
                }

                updatedUser.friends.outgoing.push(updatedFriend.id);
                updatedFriend.friends.incoming.push(updatedUser.id);

                await DataWatcher.updateUsers([updatedUser, updatedFriend]);

                io.to(updatedUser.nickname).emit('requestFriendship', {
                    type: 'success',
                    message: `Запрос на добавление в друзья ${updatedFriend.nickname} успешно отправлен`,
                    action: 'add-to',
                    friend: omit('password', updatedFriend)
                });

                io.to(updatedFriend.nickname).emit('requestFriendship', {
                    type: 'success',
                    message: `Запрос на добавление в друзья от ${updatedUser.nickname} получен`,
                    action: 'add-from',
                    friend: omit('password', updatedUser)
                });

                io.to('people').emit('update/people', {
                    type: 'success',
                    message: 'Обновлено состояние дружбы',
                    id: updatedFriend.id,
                    relation: 'outgoing',
                });
            } catch {
                socket.emit('error', {
                    type: 'error', message: 'Ошибка при добавлении в друзья'
                });
            }
        });

        socket.on('friend-delete', async (friendID) => {
            const userIndex = DataWatcher.users.findIndex(u => u.id === socket.data.id);
            const friendIndex = DataWatcher.users.findIndex(u => u.id === friendID);

            if (userIndex === -1 || friendIndex === -1) {
                socket.emit('error', {
                    type: 'error', message: 'Ошибка при поиске пользователя'
                });
                return;
            }

            try {
                const updatedUser = structuredClone(DataWatcher.users[userIndex]);
                const updatedFriend = structuredClone(DataWatcher.users[friendIndex]);
                // Проверка на верное отношение людей
                if (!checkFriendsRelation(updatedUser, updatedFriend, 'familiar')) {
                    socket.emit('error', {
                        type: 'error', message: 'Неверный запрос'
                    });
                    return;
                }
                // Удаление из активных друзей
                updatedUser.friends.active =
                    updatedUser.friends.active.filter(uid => uid !== updatedFriend.id);
                updatedFriend.friends.active =
                    updatedFriend.friends.active.filter(uid => uid !== updatedUser.id);
                // Добавление во входящие и исходящие
                updatedUser.friends.incoming.push(updatedFriend.id);
                updatedFriend.friends.outgoing.push(updatedUser.id);
                // Обновление в массиве и файле
                await DataWatcher.updateUsers([updatedUser, updatedFriend]);
                // Отправление по веб-сокетам
                io.to(updatedUser.nickname).emit('requestFriendship', {
                    type: 'success',
                    message: `Пользователь ${updatedFriend.nickname} удален из друзей`,
                    action: 'delete-to',
                    friend: omit('password', updatedFriend)
                });

                io.to(updatedFriend.nickname).emit('requestFriendship', {
                    type: 'success',
                    message: `Пользователь ${updatedUser.nickname} удалил вас из друзей`,
                    action: 'delete-from',
                    friend: omit('password', updatedUser)
                });

                io.to('people').emit('update/people', {
                    type: 'success',
                    message: 'Обновлено состояние дружбы',
                    id: updatedFriend.id,
                    relation: 'incoming',
                });
            } catch (error) {
                socket.emit('error', {
                    type: 'error', message: 'Ошибка при удалении из друзей'
                });
            }
        });

        socket.on('friend-accept', async (friendID) => {
            const userIndex = DataWatcher.users.findIndex(u => u.id === socket.data.id);
            const friendIndex = DataWatcher.users.findIndex(u => u.id === friendID);

            if (userIndex === -1 || friendIndex === -1) {
                socket.emit('error', {
                    type: 'error', message: 'Ошибка при поиске пользователя'
                });
                return;
            }

            try {
                const updatedUser = structuredClone(DataWatcher.users[userIndex]);
                const updatedFriend = structuredClone(DataWatcher.users[friendIndex]);

                if (!checkFriendsRelation(updatedFriend, updatedUser, 'invited')) {
                    socket.emit('error', {
                        type: 'error', message: 'Неверный запрос'
                    });
                    return;
                }

                updatedUser.friends.incoming =
                    updatedUser.friends.incoming.filter(uid => uid !== updatedFriend.id);
                updatedFriend.friends.outgoing =
                    updatedFriend.friends.outgoing.filter(uid => uid !== updatedUser.id);
                
                updatedUser.friends.active.push(updatedFriend.id);
                updatedFriend.friends.active.push(updatedUser.id);

                await DataWatcher.updateUsers([updatedUser, updatedFriend]);

                io.to(updatedUser.nickname).emit('requestFriendship', {
                    type: 'success',
                    message: `Запрос на добавление в друзья ${updatedFriend.nickname} принят`,
                    action: 'accept-to',
                    friend: omit('password', updatedFriend)
                });

                io.to(updatedFriend.nickname).emit('requestFriendship', {
                    type: 'success',
                    message: `Запрос на добавление в друзья ${updatedUser.nickname} принят`,
                    action: 'accept-from',
                    friend: omit('password', updatedUser)
                });

                io.to('people').emit('update/people', {
                    type: 'success',
                    message: 'Обновлено состояние дружбы',
                    id: updatedFriend.id,
                    relation: 'active',
                });
            } catch (error) {
                socket.emit('error', {
                    type: 'error', message: 'Ошибка при принятии в друзья'
                });
            }
        });

        socket.on('friend-decline', async (data) => {
            const userIndex = DataWatcher.users.findIndex(u => u.id === socket.data.id);
            const friendIndex = DataWatcher.users.findIndex(u => u.id === data.friendId);

            if (userIndex === -1 || friendIndex === -1) {
                socket.emit('error', {
                    type: 'error', message: 'Ошибка при поиске пользователя'
                });
                return;
            }

            try {
                const updatedUser = structuredClone(DataWatcher.users[userIndex]);
                const updatedFriend = structuredClone(DataWatcher.users[friendIndex]);

                if (data.type === 'outgoing') {
                    if (!checkFriendsRelation(updatedUser, updatedFriend, 'invited')) {
                        socket.emit('error', {
                            type: 'error', message: 'Неверный запрос'
                        });
                        return;
                    }

                    updatedFriend.friends.incoming =
                        updatedFriend.friends.incoming.filter(uid => uid !== updatedUser.id);
                    updatedUser.friends.outgoing =
                        updatedUser.friends.outgoing.filter(uid => uid !== updatedFriend.id);

                    await DataWatcher.updateUsers([updatedUser, updatedFriend]);

                    io.to(updatedFriend.nickname).emit('requestFriendship', {
                        type: 'success',
                        message: `Запрос на добавление в друзья ${updatedUser.nickname} отклонен`,
                        action: 'decline-to',
                        friend: omit('password', updatedUser)
                    });

                    io.to(updatedUser.nickname).emit('requestFriendship', {
                        type: 'success',
                        message: `Запрос на добавление в друзья ${updatedFriend.nickname} отклонен`,
                        action: 'decline-from',
                        friend: omit('password', updatedFriend)
                    });
                } else {
                    if (!checkFriendsRelation(updatedFriend, updatedUser, 'invited')) {
                        socket.emit('error', {
                            type: 'error', message: 'Неверный запрос'
                        });
                        return;
                    }
                    updatedUser.friends.incoming =
                        updatedUser.friends.incoming.filter(uid => uid !== updatedFriend.id);
                    updatedFriend.friends.outgoing =
                        updatedFriend.friends.outgoing.filter(uid => uid !== updatedUser.id);
    
                    await DataWatcher.updateUsers([updatedUser, updatedFriend]);

                    io.to(updatedUser.nickname).emit('requestFriendship', {
                        type: 'success',
                        message: `Запрос на добавление в друзья ${updatedFriend.nickname} отклонен`,
                        action: 'decline-to',
                        friend: omit('password', updatedFriend)
                    });

                    io.to(updatedFriend.nickname).emit('requestFriendship', {
                        type: 'success',
                        message: `Запрос на добавление в друзья ${updatedUser.nickname} отклонен`,
                        action: 'decline-from',
                        friend: omit('password', updatedUser)
                    });
                }
                io.to('people').emit('update/people', {
                    type: 'success',
                    message: 'Обновлено состояние дружбы',
                    id: updatedFriend.id,
                    relation: null,
                });
            } catch (error) {
                socket.emit('error', {
                    type: 'error', message: 'Ошибка при отклонении дружбы'
                });
            }
        });

        socket.on('likes', async (postID) => {
            console.log(io.sockets.adapter.rooms);
            console.log('likes');
            const user = DataWatcher.users.find(u => u.id === socket.data.id);
            const postIndex = DataWatcher.posts.findIndex(p => p.id === parseInt(postID, 10));
            //console.log(`userIndex = ${userIndex}, postIndex = ${postIndex}`);
            if (!user || postIndex === -1) {
                socket.emit('error', { type: 'error', message: 'Неверный данные' });
                return;
            }

            try {
                const updatedPost = DataWatcher.posts[postIndex];
                console.log(updatedPost);
                const indexUserLike = updatedPost.likes.findIndex(id => id === user.id);
                console.log(indexUserLike);

                if (indexUserLike !== -1) {
                    updatedPost.likes.splice(indexUserLike, 1);
                } else {
                    updatedPost.likes.push(user.id);
                }

                await DataWatcher.updatePost(updatedPost);

                io.to(updatedPost.author)
                    .to(`profile/${updatedPost.author}`)
                    .to(`feed/${updatedPost.author}`)
                    .emit('likes', {
                        postId: updatedPost.id,
                        likes: updatedPost.likes,
                    }
                );
            } catch {
                socket.emit('error', { type: 'error', message: 'Ошибка при установления/снятия лайка' });
                return;
            }
        });
    });
}

export function getIO() {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
}
