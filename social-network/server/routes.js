'use strict'

import express from 'express';
import DataWatcher from './data.js';

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/", (req, res) => {
    res.render('people-page', {
        people: DataWatcher.users,
        serverUrl: process.env.SERVER_URL
    });
});

router.get("/profile/:id", (req, res) => {
    const profile_id = parseInt(req.params.id, 10);
    const profile = DataWatcher.users.find(user => user.id === profile_id);

    if (!profile) {
        return res.redirect("/error");
    }

    const profile_posts = DataWatcher.posts.filter(p => p.author === profile.nickname);
    profile_posts.reverse();

    res.render('profile-page', {
        id: profile.id,
        nickname: profile.nickname,
        name: profile.name,
        surname: profile.surname,
        avatar: profile.avatar,
        birthday: profile.birthday,
        email: profile.email,
        about: profile.about,
        cover: profile.cover,
        role: profile.role,
        friends: profile.friends,
        posts: profile_posts,
        serverUrl: process.env.SERVER_URL
    });
});

router.get("/people", (req, res) => {
    res.render('people-page', {
        people: DataWatcher.users,
        serverUrl: process.env.SERVER_URL
    });
});

router.get("/search", (req, res) => {
    const query = req.query.query;

    if (!query || query.trim() === '') {
        return res.status(400).send("Поисковой запрос не указан или пуст!");
    }

    const search_terms = query.toLowerCase().split(' ');

    const results = DataWatcher.users.filter(user => {
        const user_name = user.name.toLowerCase();
        const user_surname = user.surname.toLowerCase();
        return search_terms.every(term => user_name.includes(term) || user_surname.includes(term));
    });

    res.json(results);
});

// friends_posts
function compareDates(a, b) {
    const [day1, month1, year1] = a.date.split('-').map(Number);
    const [day2, month2, year2] = b.date.split('-').map(Number);

    const parsedDate1 = new Date(year1, month1 - 1, day1);
    const parsedDate2 = new Date(year2, month2 - 1, day2);

    if (parsedDate1 > parsedDate2) {
        return -1;
    } else if (parsedDate1 < parsedDate2) {
        return 1;
    } else {
        return 0;
    }
}

router.get("/getSectionContent", (req, res) => {
    const section = req.query.section;

    const refererUrl = req.headers.referer || req.get('Referer'); // Получаем URL, с которого пришел запрос
    const arr = refererUrl.split('/');
    const profile_id = parseInt(arr[arr.length - 1], 10);

    const profile = DataWatcher.users.find(user => user.id === profile_id);

    if (section == "posts") {
        const profile_posts = DataWatcher.posts.filter(p => p.author === profile.nickname);
        profile_posts.reverse();
        return res.render('posts-section', {
            name: profile.name,
            surname: profile.surname,
            avatar: profile.avatar,
            posts: profile_posts,
            serverUrl: process.env.SERVER_URL
        });
    }
    else if (section == "friends") {
        const friends = {};
        for (const key in profile.friends) {
            friends[key] = profile.friends[key]
                .map(id => DataWatcher.users.find(user => user.id === id))
                .filter(Boolean);
        }
        return res.render('friends-section', {
            friendsMap: friends,
            serverUrl: process.env.SERVER_URL
        });
    }
    else if (section == "friends-posts") {
        const friendsNicknames = profile.friends.active
            .map(id => DataWatcher.users.find(u => u.id === id)?.nickname)
            .filter(n => n != null);
        const friendsPosts = DataWatcher.posts.filter(p => friendsNicknames.includes(p.author));
        friendsPosts.sort(compareDates);
        return res.render('friends-posts-section', {
            friends_posts: friendsPosts || [],
            serverUrl: process.env.SERVER_URL
        });
    }
});

router.put("/profile/:id/status", async (req, res) => {
    try {
        const profile_id = parseInt(req.params.id, 10);

        const profile = DataWatcher.users.find(user => user.id === profile_id);

        if (!profile) {
            return res.redirect("/error");
        }

        const updatedUser = structuredClone(profile);
        updatedUser.status = req.body.status;

        await DataWatcher.updateUser(updatedUser);
        
        res.status(200).json({ message: "Status succesfully changed!" });
    } catch (err) {
        res.status(500).json({ error: "Error when changing status!" });
    }
});

router.put("/profile/:id/role", async (req, res) => {
    try {
        const profile_id = parseInt(req.params.id, 10);
        const profile = DataWatcher.users.find(user => user.id === profile_id);

        if (!profile) {
            return res.redirect("/error");
        }

        const updatedUser = structuredClone(profile);
        updatedUser.role = req.body.role;
        await DataWatcher.updateUser(updatedUser);

        res.status(200).json({ message: "Role succesfully changed!" });
    } catch (err) {
        res.status(500).json({ error: "Error when changing role!" });
    }
});

router.put("/profile/:id/update", async (req, res) => {
    try {
        const profileId = parseInt(req.params.id, 10);
        const profile = DataWatcher.users.find(user => user.id === profileId);

        if (!profile) {
            return res.redirect("/error");
        }

        const { name, surname, birthday, email } = req.body;

        const updatedUser = structuredClone(profile);
        updatedUser.name = name;
        updatedUser.surname = surname;
        updatedUser.birthday = birthday;
        updatedUser.email = email;
        await DataWatcher.updateUser(updatedUser);

        res.status(200).json({ message: "Profile updated successfully!" });
    } catch {
        res.status(500).json({ error: "Error when changing birthday and email!" });
    }
})

router.get("/error", (req, res) => {
    res.render('error-page');
});

export { router };
