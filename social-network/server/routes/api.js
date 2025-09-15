'use strict'

import express from 'express';
import { promises as fs } from "fs";
import * as fss from 'fs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import DataWatcher from '../data.js';
import { getIO } from './sockets.js';
import path from 'path';

const apiRouter = express.Router();

apiRouter.use(express.json());
apiRouter.use(express.urlencoded({ extended: true }));

const privateKey = fss.readFileSync(path.join(process.cwd(), "sslcert", "private.key"), "utf-8");

const storageAvatars = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), '/public/uploads/avatars'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname); // расширение
        const base = path.basename(file.originalname, ext); // имя без расширения
        cb(null, base + '-' + uniqueSuffix + ext);
    }
});

const storagePostImages = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), '/public/uploads/posts'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname); // расширение
        const base = path.basename(file.originalname, ext); // имя без расширения
        cb(null, base + '-' + uniqueSuffix + ext);
    }
});

const uploadAvatar = multer({ storage: storageAvatars });
const uploadPosts  = multer({ storage: storagePostImages });

const requiredKeysEditProfile = ['name', 'surname', 'about'];

function hasKeys(obj, keys) {
  return keys.every(key => Object.prototype.hasOwnProperty.call(obj, key));
}

function omit(key, obj) {
    if (!obj) return obj;
    const { [key]: omitted, ...rest } = obj;
    return rest;
}

function transformFriends(friends) {
    const friendsTransformed = structuredClone(friends);
    for (const key in friends) {
        friendsTransformed[key] = friendsTransformed[key].map(id => omit('password', DataWatcher.users.find(u => u.id === id))).filter(Boolean);
    }
    return friendsTransformed;
}

apiRouter.get('/posts/:nickname', (request, response) => {
    const profile = DataWatcher.users.find(user => user.nickname === request.params.nickname);
    if (!profile) {
        return response.status(404).json({ error: 'The profile was not found!' });
    }
    try {
        const profile_posts = DataWatcher.posts.filter(p => p.author === profile.nickname);
        return response.status(200).json(profile_posts);
    } catch (error) {
        return response.status(500).json({ error: 'Error when getting posts!' });
    }
});

apiRouter.get('/posts/:nickname/friends', (request, response) => {
    const userIndex = DataWatcher.users.findIndex(u => u.nickname === request.params.nickname);
    if (userIndex === -1) {
        return response.status(404).json({ error: 'User was not found!' });
    }
    try {
        const friendsIds = DataWatcher.users[userIndex].friends.active; 
        const friendsNicknames = friendsIds
            .map(id => DataWatcher.users.find(u => u.id === id)?.nickname)
            .filter(n => n != null);
        const friendsPosts = DataWatcher.posts.filter(p => friendsNicknames.includes(p.author));
        return response.status(200).json(friendsPosts);
    } catch (error) {
        return response.status(500).json({ error: 'Error when getting friends posts!' });
    }
});

apiRouter.get('/profile/:nickname', (request, response) => {
    const user = DataWatcher.users.find(u => u.nickname === request.params.nickname);
    if (!user) {
        return response.status(404).json({ error: 'The user was not found!' });
    }
    try {
        return response.status(200).json({
            id: user.id,
            nickname: user.nickname,
            name: user.name,
            surname: user.surname,
            avatar: user.avatar,
            about: user.about,
            status: user.status,
        });
    } catch (error) {
        return response.status(500).json({ error: 'Error when getting profile information!' });
    }
});

apiRouter.post('/registration', async (request, response) => {
    try {
        const user = DataWatcher.users.find(user => user.nickname === request.body.nickname);
        if (user) {
            return response.status(500).json({ error: 'A user with the current nickname already exists' });
        }
        const id = DataWatcher.users[DataWatcher.users.length - 1].id + 1;
        await DataWatcher.appendUser(
            {
                id: id,
                nickname: request.body.nickname,
                name: request.body.name,
                surname: request.body.surname,
                avatar: null,
                about: null,
                email: request.body.email,
                birthday: request.body.birthday,
                role: 'member',
                status: 'active',
                friends: {
                    active: [],
                    outgoing: [],
                    incoming: []
                },
                posts: [],
                password: await bcrypt.hash(request.body.password, 8)
            }
        );
        const token = jwt.sign(DataWatcher.users[DataWatcher.users.length - 1], privateKey, { expiresIn: '4h' });
        return response.status(200).json({
            id: id,
            nickname: request.body.nickname,
            name: request.body.name,
            surname: request.body.surname,
            friends: [],
            token: token,
        });
    } catch (error) {
        return response.status(500).json({ error: 'Error when adding a new user!' });
    }
});

apiRouter.post('/login', async (request, response) => {
    try {
        const user = DataWatcher.users.find(user => user.nickname === request.body.nickname);
        if (!user) {
            return response.status(500).json({ error: 'The user was not found!' });
        }
        if (await bcrypt.compare(request.body.password, user.password)) {
            const token = jwt.sign(user, privateKey, { expiresIn: '4h' });

            const friends = {
                active: [],
                outgoing: [],
                incoming: [],
            };
            for (const key in user.friends) {
                for (let i = 0; i < user.friends[key].length; i++) {
                    friends[key].push(DataWatcher.users.find(u => u.id === user.friends[key][i]));
                }
            }
            response.status(200).json({ 
                id: user.id,
                name: user.name,
                surname: user.surname,
                nickname: user.nickname,
                role: user.role,
                friends: friends,
                token: token,
            });
        } else {
            return response.status(500).json({ error: 'The passwords didn\'t match' });
        }
    } catch (error) {
        return response.status(500).json({ error: 'Error when logging!' });
    }
});

apiRouter.post('/me', (request, response) => {
    const token = request.body.token;
    if (!token) {
        return response.status(502).json({ error: 'Invalid token' });
    }
    try {
        const payload = jwt.verify(token, privateKey);
        const user = DataWatcher.users.find(u => u.id === payload.id);
        if (!user) {
            return response.status(404).json({ error: 'User was not found' });
        }

        const newUser = structuredClone(user);
        for (const key in newUser.friends) {
            for (let i = 0; i < newUser.friends[key].length; i++) {
                newUser.friends[key][i] = DataWatcher.users.find(u => u.id === newUser.friends[key][i]);
            }
        }

        return response.status(200).json(JSON.stringify(omit('password', newUser)));
    } catch {
        return response.status(500).json({ error: 'Invalid or expired token' });
    }
});

apiRouter.get('/friends/:nickname', (request, response) => {
    const user = DataWatcher.users.find(user => user.nickname === request.params.nickname);
    if (!user) {
        return response.status(502).json({ error: 'This user does not exist' });
    }
    try {
        const friends = { active: [], outgoing: [], incoming: [] };
        for (const key in friends) {
            user.friends[key].forEach((friendId) => {
                const friend = DataWatcher.users.find(user => user.id === friendId);
                const friendInfo = {
                    id: friend.id,
                    name: friend.name,
                    surname: friend.surname,
                    nickname: friend.nickname,
                    avatar: `${request.protocol}://${request.get('host')}/${friend.avatar}`,
                    about: friend.about,
                };
                friends[key].push(friendInfo);
            });
        }
        return response.status(200).json(friends);
    } catch (error) {
        return response.status(500).json({ error: 'Errow when finding friends!' })
    }
});

apiRouter.get('/people', function (request, response) {
    try {
        const people = [];
        for (const user of DataWatcher.users) {
            people.push({
                id: user.id,
                name: user.name,
                surname: user.surname,
                nickname: user.nickname,
                avatar: user.avatar,
                about: user.about,
                status: user.status,
                friends: transformFriends(user.friends), 
            });
        }
        return response.status(200).json(people);
    } catch (error) {
        return response.status(500).json({ error: 'Error when getting people!' });
    }
});

apiRouter.post('/edit-profile', uploadAvatar.single('avatar'), async (request, response) => {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
        return response.status(403).json({ error: 'Incorrect or expired token' });
    }
    try {
        const payload = jwt.verify(token, privateKey);
        const user = DataWatcher.users.find(u => u.id === payload.id);
        if (!user) {
            return response.status(404).json({ error: 'User was not found' });
        }
        const data = JSON.parse(request.body.info);
        if (!hasKeys(data, requiredKeysEditProfile)) {
            return response.status(400).json({ error: 'Incorrect data' });
        }

        const updatedUser = structuredClone(user);
        // Обновление аватара, если он переданc
        const avatar = request.file;
        if (avatar && updatedUser.avatar !== avatar.filename)
            updatedUser.avatar = `uploads/avatars/${avatar.filename}`;
        // Обновление name, surname, about
        updatedUser.name = data.name;
        updatedUser.surname = data.surname;
        updatedUser.about = data.about;

        await DataWatcher.updateUser(updatedUser);
        // Передача всем людям находящимся в профиле информации об изменении
        const io = getIO();
        io.to(`profile/${updatedUser.nickname}`).emit('update/profile', {
            name: updatedUser.name,
            surname: updatedUser.surname,
            about: updatedUser.about,
            avatar: updatedUser.avatar
        });
        return response.status(200).json({
            name: updatedUser.name,
            surname: updatedUser.surname,
            about: updatedUser.about,
            avatar: updatedUser.avatar
        });
    } catch {
        return response.status(403).json({ error: 'Invalid or expired token' });
    }
});

apiRouter.post('/new-post', uploadPosts.single('image'), async (request, response) => {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
        return response.status(403).json({ error: 'Incorrect token' });
    }
    try {
        const payload = jwt.verify(token, privateKey);
        const user = DataWatcher.users.find(u => u.id === payload.id);
        if (!user) {
            return response.status(404).json({ error: 'User was not found' });
        }
        const text = request.body.text;
        const image = request.file;

        if (!text && !image)
            return response.status(400).json({ error: 'Incorrect data' });

        const id = DataWatcher.postsMaxID;

        const newPost = {
            id,
            author: user.nickname,
            text,
        };

        if (image) newPost.image = `uploads/posts/${image.filename}`;

        await DataWatcher.appendPost(newPost);

        const post = DataWatcher.posts.find(p => p.id === id);

        const io = getIO();
        // Активные друзья в ленте подключаются в эту комнату
        io.to(`feed/${user.nickname}`).emit('post/add', { post, listKey: 'feed' });
        // Людям, просматривающих профиль
        io.to(`profile/${user.nickname}`).emit('post/add', { post, listKey: `user:${user.nickname}` });
        return response.status(200).json(post);
    } catch {
        return response.status(403).json({ error: 'Invalid or expired token' });
    }
});

apiRouter.put('/delete-avatar', async (request, response) => {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
        return response.status(403).json({ error: 'Incorrect token' });
    }
    try {
        const payload = jwt.verify(token, privateKey);
        const user = DataWatcher.users.find(u => u.id === payload.id);
        if (!user) {
            return response.status(404).json({ error: 'User was not found' });
        }

        if (!user.avatar)
            return response.status(200).json(omit('password', user));
        const filePath = path.join(process.cwd(), 'public', user.avatar);
        user.avatar = null;

        await DataWatcher.updateUser(user);
        await fs.unlink(filePath, (err) => {
            if (err) throw new Error('Error when delete file');
        });
        const io = getIO();
        io.to(`profile/${user.nickname}`).emit('update/profile', {
            name: user.name,
            surname: user.surname,
            about: user.about,
            avatar: user.avatar
        });
        return response.status(200).json(omit('password', user));
    } catch {
        return response.status(403).json({ error: 'Invalid or expired token' });
    }
});

export { apiRouter }
