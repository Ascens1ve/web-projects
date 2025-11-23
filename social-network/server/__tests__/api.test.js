import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { DataWatcher } from '../data.core.js';

const userQwerty = {
  "id": 24,
  "nickname": "qwerty123",
  "name": "qwerty123",
  "surname": "qwerty123",
  "avatar": "uploads/avatars/Charming Gray Cat With Red Umbrella On Cobblestone Street-1756316609904-949183419.png",
  "about": "",
  "status": "active",
  "friends": {
    "active": [
      {
        "id": 0,
        "nickname": "professor",
        "name": "Mickey",
        "surname": "Langedate",
        "avatar": "/uploads/cat-lol.webp",
        "about": "Something about me. Hello Meow!",
        "birthday": "13.05.2004",
        "email": "proffesor14@gmail.com",
        "cover": "/uploads/catcity.webp",
        "role": "member",
        "status": "active",
        "friends": {
          "active": [24],
          "outgoing": [],
          "incoming": []
        }
      }
    ],
    "outgoing": [],
    "incoming": []
  },
}

const userProfessor = {
  "id": 0,
  "nickname": "professor",
  "name": "Mickey",
  "surname": "Langedate",
  "avatar": "/uploads/cat-lol.webp",
  "about": "Something about me. Hello Meow!",
  "status": "active",
  "friends": {
    "active": [
      {
        "id": 24,
        "nickname": "qwerty123",
        "name": "qwerty123",
        "surname": "qwerty123",
        "avatar": "uploads/avatars/Charming Gray Cat With Red Umbrella On Cobblestone Street-1756316609904-949183419.png",
        "about": "",
        "email": "i1214124@mail.ru",
        "birthday": "2025-08-01",
        "role": "member",
        "status": "active",
        "friends": {
          "active": [0],
          "outgoing": [],
          "incoming": []
        },
      }
    ],
    "outgoing": [],
    "incoming": []
  }
}

const fullUserProfessor = {
  "id": 0,
  "nickname": "professor",
  "name": "Mickey",
  "surname": "Langedate",
  "avatar": "/uploads/cat-lol.webp",
  "about": "Something about me. Hello Meow!",
  "birthday": "13.05.2004",
  "email": "proffesor14@gmail.com",
  "cover": "/uploads/catcity.webp",
  "role": "member",
  "status": "active",
  "friends": {
    "active": [
      24
    ],
    "outgoing": [],
    "incoming": []
  }
};

describe('GET', () => {
  let app, store;

  describe('/people', () => {

    beforeEach(async () => {
      jest.resetModules();
      store = new DataWatcher('./__tests__/users.json', './__tests__/posts.json');
      await store.init();

      jest.unstable_mockModule('../data.js', () => ({
        __esModule: true,
        default: store,
        DataWatcher,
      }));

      const { apiRouter } = await import('../routes/api.js');

      app = express();
      app.use('/api', apiRouter);
    });

    it('Correct', async () => {
      const res = await request(app).get('/api/people');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        userProfessor,
        userQwerty
      ]);
    });

    it('Incorrect getting users', async () => {
      const spy = jest.spyOn(store, 'users', 'get')
      .mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).get('/api/people');
      expect(res.status).toBe(500);
      spy.mockRestore();
    });

  });

  describe('/posts/:nickname', () => {
    
    beforeEach(async () => {
      jest.resetModules();
      store = new DataWatcher('./__tests__/users.json', './__tests__/posts.json');
      await store.init();

      jest.unstable_mockModule('../data.js', () => ({
        __esModule: true,
        default: store,
        DataWatcher,
      }));

      const { apiRouter } = await import('../routes/api.js');

      app = express();
      app.use('/api', apiRouter);
    });

    it('Correct profile name', async () => {
      const res = await request(app).get('/api/posts/professor');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        {
          "id": 1,
          "author": "professor",
          "date": "2015-02-03",
          "image": "/uploads/15 Quotes From Latinx Authors That Will Make You Want To Pick Up Their Books ASAP.jpg",
          "text": "Сегодня прекрасный день!",
          "likes": [
            0,
            1,
            18,
            21
          ]
        },
        {
          "id": 2,
          "author": "professor",
          "date": "2004-05-17",
          "image": "/uploads/MainAfter.webp",
          "text": "Утро началось странно: кофе сбежал из кружки, тапок решил, что он теперь коврик, а кот занял моё рабочее место и смотрел на монитор так, будто знает пароль от моего аккаунта. На улице воробьи устраивали рэп-баттл, а сосед сверху опять репетировал балет, судя по звукам. Решил пойти прогуляться, но нашёл в холодильнике забытую пиццу — и понял, что прогулка подождёт. В итоге день прошёл под лозунгом: \"Ничего не жди, пока не съешь!\" Всё бы ничего, если бы вечером не выяснилось, что кот реально знает пароль. 🙀",
          "likes": [
            0,
            18,
            21
          ]
        }
      ]);

    });

    it('Incorrect profile name', async () => {
      const res = await request(app).get('/api/posts/profi1234');
      expect(res.status).toBe(404);
    });

    it('Incorrect getting posts', async () => {
      const spy = jest.spyOn(store, 'posts', 'get')
        .mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).get('/api/posts/professor');
      expect(res.status).toBe(500);
      spy.mockRestore();
    });
  
  });

  describe('/posts/:nickname/friends', () => {

    beforeEach(async () => {
      jest.resetModules();
      store = new DataWatcher('./__tests__/users.json', './__tests__/posts.json');
      await store.init();

      jest.unstable_mockModule('../data.js', () => ({
        __esModule: true,
        default: store,
        DataWatcher,
      }));

      const { apiRouter } = await import('../routes/api.js');

      app = express();
      app.use('/api', apiRouter);
    });

    it('Correct nickname', async () => {
      const res = await request(app).get('/api/posts/professor/friends');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        {
          "date": "2025-08-20",
          "likes": [],
          "id": 10,
          "author": "qwerty123",
          "text": "324234"
        },
        {
          "date": "2025-08-20",
          "likes": [],
          "id": 11,
          "author": "qwerty123",
          "text": "234324"
        }
      ]);
    });

    it('Incorrect nickname', async () => {
      const res = await request(app).get('/api/posts/profi1234/friends');
      expect(res.status).toBe(404);
    });

    it('Incorrect getting posts', async () => {
      const spy = jest.spyOn(store, 'posts', 'get')
        .mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).get('/api/posts/professor/friends');
      expect(res.status).toBe(500);
      spy.mockRestore();
    });

  });

  describe('/profile/:nickname', () => {

    beforeEach(async () => {
      jest.resetModules();
      store = new DataWatcher('./__tests__/users.json', './__tests__/posts.json');
      await store.init();

      jest.unstable_mockModule('../data.js', () => ({
        __esModule: true,
        default: store,
        DataWatcher,
      }));

      const { apiRouter } = await import('../routes/api.js');

      app = express();
      app.use('/api', apiRouter);
    });

    it('Correct nickname', async () => {
      const res = await request(app).get(`/api/profile/${userQwerty.nickname}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        id: userQwerty.id,
        nickname: userQwerty.nickname,
        name: userQwerty.name,
        surname: userQwerty.surname,
        avatar: userQwerty.avatar,
        about: userQwerty.about,
        status: userQwerty.status,
      });
    });

    it('Incorrect nickname', async () => {
      const res = await request(app).get('/api/profile/profi1234');
      expect(res.status).toBe(404);
    });

  });

  describe('/friends/:nickname', () => {

    beforeEach(async () => {
      jest.resetModules();
      store = new DataWatcher('./__tests__/users.json', './__tests__/posts.json');
      await store.init();

      jest.unstable_mockModule('../data.js', () => ({
        __esModule: true,
        default: store,
        DataWatcher,
      }));

      const { apiRouter } = await import('../routes/api.js');

      app = express();
      app.use('/api', apiRouter);
    });

    it('Correct nickname', async () => {
      const res = await request(app).get(`/api/friends/${userQwerty.nickname}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        active: [
          {
            id: 0,
            name: 'Mickey',
            surname: 'Langedate',
            nickname: 'professor',
            avatar: expect.stringContaining('uploads/cat-lol.webp'),
            about: 'Something about me. Hello Meow!'
          }
        ],
        outgoing: [],
        incoming: []
      });
    });

    it ('Incorrect nickname', async () => {
      const res = await request(app).get(`/api/friends/profi1234`);
      expect(res.status).toBe(502);
    });

  });

});

describe('POST', () => {

  describe('/registration', () => {

    beforeEach(async () => {
      jest.resetModules();
      store = new DataWatcher('./__tests__/users.json', './__tests__/posts.json');
      await store.init();

      jest.unstable_mockModule('../data.js', () => ({
        __esModule: true,
        default: store,
        DataWatcher,
      }));

      const { apiRouter } = await import('../routes/api.js');

      app = express();
      app.use('/api', apiRouter);
    });

    it('Nickname already exist', async () => {
      const res = await request(app).post('/api/registration').send({ nickname: 'professor' });
      expect(res.status).toBe(403);
    });

    it('Correct registration', async () => {
      const id = store.usersMaxID;
      const res = await request(app).post('/api/registration').send({
        name: 'test',
        surname: 'testov',
        nickname: 'tester',
        email: 'test@test.org',
        birthday: '2004-08-01',
        password: 'qwerty123'
      });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        id,
        name: 'test',
        surname: 'testov',
        nickname: 'tester',
        friends: {
            active: [],
            incoming: [],
            outgoing: []
        },
        token: expect.any(String)
      });
    });

  });

  describe('/login', () => {

    beforeEach(async () => {
      jest.resetModules();
      store = new DataWatcher('./__tests__/users.json', './__tests__/posts.json');
      await store.init();

      jest.unstable_mockModule('../data.js', () => ({
        __esModule: true,
        default: store,
        DataWatcher,
      }));

      const { apiRouter } = await import('../routes/api.js');

      app = express();
      app.use('/api', apiRouter);
    });

    it('Correct data', async () => {
      const res = await request(app).post('/api/login').send({
        nickname: 'qwerty123',
        password: 'qwerty123'
      });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        id: userQwerty.id,
        name: userQwerty.name,
        surname: userQwerty.surname,
        nickname: userQwerty.nickname,
        role: userQwerty.role ?? 'member',
        token: expect.any(String),
        friends: {
          active: [{
            ...fullUserProfessor,
            password: undefined,
          }],
          incoming: [],
          outgoing: [],
        }
      });
    });

    it('Incorrect nickname', async () => {
      const res = await request(app).post('/api/login').send({
        nickname: 'qwerty1232344323',
        password: 'qwerty123'
      });
      expect(res.status).toBe(404);
    });

    it('Incorrect password', async () => {
      const res = await request(app).post('/api/login').send({
        nickname: 'qwerty123',
        password: 'qwertyfds123'
      });
      expect(res.status).toBe(403);
    });

  });

});
