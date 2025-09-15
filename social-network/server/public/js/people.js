jQuery(function() {
    $('#people-search').keyup(function() {
        const searchTerm = $(this).val().toLowerCase();
        $('.person-with-line').each(function() {
            const name = $(this).find('.person-fullname').text().toLowerCase();
            const nickname = $(this).find('.person-nickname').text().toLowerCase();  
            if (name.includes(searchTerm) || nickname.includes(searchTerm)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });

    $(".status-change").selectmenu({
        change: function(event, ui) {
            const new_status = ui.item.value;
            const profile_id = $(this).data('user-id');
            $.ajax({
                type: "PUT",
                url: `/profile/${profile_id}/status`,
                contentType: "application/json",
                data: JSON.stringify({ status: new_status }),
                error: function(xhr, status, error) {
                    console.error('Error:', error);
                }
            });
        }
    });

    $(".role-change").selectmenu({
        change: function(event, ui) {
            const new_role = ui.item.value;
            const profile_id = $(this).data('user-id');
            $.ajax({
                type: "PUT",
                url: `/profile/${profile_id}/role`,
                contentType: "application/json",
                data: JSON.stringify({ role: new_role }),
                error: function(xhr, status, error) {
                    console.error('Error:', error);
                }
            });
        }
    });

    $(".button-view").click(function(event) {
        event.preventDefault();
        const isEditing = $(this).attr("data-editing") === "true";
        const profile_id = $(this).data('user-id');
        console.log(profile_id);
        if (isEditing) {
            const newBirthday = $(`.birthday-input-${profile_id}`).val();
            const newEmail = $(`.email-input-${profile_id}`).val();
            const newName = $(`.name-input-${profile_id}`).val();
            const newSurname = $(`.surname-input-${profile_id}`).val();
            
            const $its = $(this);

            $.ajax({
            type: "PUT",
            url: `/profile/${profile_id}/update`,
            data: {
                name: newName,
                surname: newSurname,
                birthday: newBirthday,
                email: newEmail
            },
            success: function(response) {
                $(`.birthday-text-${profile_id}`).text(newBirthday).show();
                $(`.email-text-${profile_id}`).text(newEmail).show();
                $(`.fullname-text-${profile_id}`).text(newName + " " + newSurname).show();
                $(`.birthday-input-${profile_id}`).hide();
                $(`.email-input-${profile_id}`).hide();
                $(`.name-input-${profile_id}`).hide();
            $(`.surname-input-${profile_id}`).hide();
                $its.text("Изменить данные");
                $its.attr("data-editing", "false");
            },
            error: function(xhr, status, error) {
                console.error('Error:', error);
            }
            });
        } else {
            // Переход в режим редактирования
            $(`.fullname-text-${profile_id}`).hide();
            $(`.birthday-text-${profile_id}`).hide();
            $(`.email-text-${profile_id}`).hide();
            $(`.name-input-${profile_id}`).show();
            $(`.surname-input-${profile_id}`).show();
            $(`.birthday-input-${profile_id}`).show();
            $(`.email-input-${profile_id}`).show();
            $(this).text("Сохранить");
            $(this).attr("data-editing", "true");
        }
    });
});

$(function() {
    $(".role-change").selectmenu();
    $(".status-change").selectmenu();
    $(".button-view").button();
});
