(function() {
    if (window.friendInit) return;
    window.friendInit = true;

    const friendsSections = {
        active: document.querySelector("#friends__active"),
        outgoing: document.querySelector("#friends__outgoing"),
        incoming: document.querySelector("#friends__incoming"),
    };

    const container = document.querySelector(".friends__container");
    const serverUrl = window.serverUrl;
    const friends = window.friendsMap;
    let people = friends.active;
    friendsSections.active.classList.add("friends__header_active");

    function renderFriends(list) {
        container.innerHTML = list.map(person => {
            const avatar = person.avatar ? `${serverUrl}/${person.avatar}` : '/uploads/angry-birds.jpg';
            return `
                <div class="person-with-line">
                    <div class="person-container">
                        <img class="person-avatar" src="${avatar}" width="180" height="180">
                        <div class="person-info">
                            <div class="person-ids">
                                <h2 class="person-fullname">${person.name} ${person.surname}</h2>
                                <h2 class="person-nickname">
                                    <a href="/profile/${person.id}" class="nickname-link">@${person.nickname}</a>
                                </h2>
                            </div>
                            <div class="line-1px"></div>
                            <h2 class="person-birthday person-info__text">Дата рождения: ${person.birthday}</h2>
                            <h2 class="person-email person-info__text">Почта: ${person.email}</h2>
                            <h2 class="person-role person-info__text">Роль: ${person.role}</h2>
                            <h2 class="person-status person-info__text">Статус: ${person.status}</h2>
                        </div>
                    </div>
                </div>
                <div class="line-1px"></div>
            `;
        }).join("");
    }

    renderFriends(people);

    Object.keys(friendsSections).forEach(function(key) {
        friendsSections[key].addEventListener("click", function() {
            people = friends[key];
            renderFriends(people);
            Object.values(friendsSections).forEach(section =>
                section.classList.remove("friends__header_active")
            );
            friendsSections[key].classList.add("friends__header_active");
        });
    });
})();