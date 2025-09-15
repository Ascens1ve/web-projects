$(window).on("load", () => {
    $(".post-image").each((index, element) => {

        const parentElement = $(element).parent();
        const parentWidth = parentElement.width();
        $(element).css("max-width", `${parentWidth}px`);

        const image_max_width = parseInt($(element).css("max-width"));
        const image_max_height = parseInt($(element).css("max-height"));
        console.log(image_max_width);
        
        const bgImage = new Image();
        const bgUrl = $(element).css("background-image").replace(/url\((['"])?(.*?)\1\)/gi, '$2');
        bgImage.src = bgUrl;

        bgImage.onload = () => {
            const image_width = bgImage.width;
            const image_height = bgImage.height;

            if (image_width > image_max_width || image_height > image_max_height) {
                console.log("Here")
                $(element).css({
                    "width": `${image_max_width}px`,
                    "height": `${image_max_height}px`,
                    "background-size": "contain",
                    "background-position": "center",
                });
            } else {
                $(element).css({
                    "width": `${image_width}px`,
                    "height": `${image_height}px`
                });
            }
        };
    });
});

$(document).ready(function() {
    $(".transit").on("click", function() {
        const sectionId = $(this).attr('id');

        // Проверка, чтобы избежать повторных запросов
        if ($(this).hasClass('loading')) {
            return; 
        }
        const $its = $(this);

        $.ajax({
            url: '/getSectionContent',
            method: 'GET',
            data: { section: sectionId },
            success: function(response) {
                $(".content").html(response);
            },
            error: function(error) {
                console.error('Ошибка при запросе:', error);
            },
            complete: function() {
                $(".transit").removeClass('loading');
                $(".transit").removeClass('bold-text');
                $its.addClass('loading');
                $its.addClass('bold-text');
            }
        });
    });
});