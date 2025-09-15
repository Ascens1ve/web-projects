import { promises as fs } from 'fs';
import path from 'path';
import { getCurrentDate } from './helper.js';

class AsyncQueue {
    last = Promise.resolve();
    push(task) {
        const run = () => Promise.resolve().then(task);
        this.last = this.last.then(run, run);
        return this.last;
    }
}


class DataWatcher {
    constructor() {
        this.usersPath = './users.json';
        this.postsPath = './posts.json';
        this.queue = new AsyncQueue();
        this._users = [];
        this.usersLastID = -1;
        this._posts = [];
        this.postsLastID = -1;
        this.init();
    }

    async init() {
        this._users = JSON.parse(await fs.readFile(path.join(process.cwd(), this.usersPath), 'utf-8'));
        this.usersLastID = Math.max(...this.users.map(p => p.id ?? -1));
        this._posts = JSON.parse(await fs.readFile(path.join(process.cwd(), this.postsPath), 'utf-8'));
        this.postsLastID = Math.max(...this.posts.map(p => p.id ?? -1));
    }

    get users() {
        return this._users;
    }

    set users(data) {
        this._users = data;
    }
    
    get posts() {
        return this._posts;
    }

    set posts(data) {
        this._posts = data;
    }

    get usersMaxID() {
        return this.usersLastID + 1;
    }

    get postsMaxID() {
        return this.postsLastID + 1;
    }

    async appendUser(user) {
        await this.queue.push(async () => {
            try {
                const usersCopy = [...this.users];
                usersCopy.push(user);
                await this.saveUsersJSON(usersCopy);
                this.users = usersCopy; // Или просто push
                this.usersLastID += 1;
            } catch {
                throw new Error('Ошибка при добавление пользователя');
            }
        });
    }

    async updateUser(user) {
        await this.queue.push(async () => {
            try {
                const index = this.users.findIndex(u => u.id === user.id);
                const usersCopy = [...this.users];
                usersCopy[index] = user;
                await this.saveUsersJSON(usersCopy);
                this.users = usersCopy;
            } catch {
                throw new Error('Ошибка при изменении пользователя');
            }
        });
    }

    async updateUsers(users) {
        await this.queue.push(async () => {
            const usersCopy = [...this.users];
            for (const user of users) {
                const index = this.users.findIndex(u => u.id === user.id);
                usersCopy[index] = user;
            }
            try {
                await this.saveUsersJSON(usersCopy);
                this.users = usersCopy;
            } catch {
                throw new Error('Ошибка при изменении пользователей');
            }
        });
    }

    async appendPost(post) {
        await this.queue.push(async () => {
            try {
                const postsCopy = [...this.posts];
                postsCopy.push({
                    date: getCurrentDate(),
                    likes: [],
                    ...post
                });
                await this.savePostsJSON(postsCopy);
                this.posts = postsCopy;
                this.postsLastID += 1;
            } catch {
                throw new Error('Ошибка при добавлении поста');
            }
        });
    }

    async updatePost(post) {
        await this.queue.push(async () => {
            try {
                const index = this.posts.findIndex(p => p.id === post.id);
                const postsCopy = [...this.posts];
                postsCopy[index] = post;
                await this.savePostsJSON(postsCopy);
                this.posts = postsCopy; 
            } catch {
                throw new Error('Ошибка при изменении поста');
            }
        });
    }

    async saveUsersJSON(data) {
        const tmp = this.usersPath + `.${process.pid}.tmp`;
        await fs.writeFile(tmp, JSON.stringify(data, null, 2));
        await fs.rename(tmp, this.usersPath);
    }

    async savePostsJSON(data) {
        const tmp = this.postsPath + `.${process.pid}.tmp`;
        await fs.writeFile(tmp, JSON.stringify(data, null, 2));
        await fs.rename(tmp, this.postsPath);
    }
}

export default new DataWatcher();