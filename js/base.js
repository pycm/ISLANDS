$(function() {
    var $suggestBox = $('.search-suggest-box');

    $('#search-form .form-text').keyup(function(e) {
        var $target = $(e.target),
            text = $target.val();

        if (text) {
            $suggestBox.css({
                top: $target.offset().top + 25,
                left: $target.offset().left
            });
            $suggestBox.show();
        }
        else {
            $suggestBox.hide();
        }
    });

    $(document.body).click(function(e) {
        var target = e.target,
            parent = target;

        while (parent !== document.body) {
            if (parent.className === 'search-suggest-box') {
                return;
            }
            parent = parent.parentNode;
        }

        $suggestBox.hide();
    });
});


$(function() {
    setTimeout(function() {
        $('.custom-checkbox').each(function(ind, wrapper) {
            $(wrapper).click(function(e) {
                $(wrapper).toggleClass('checked');
            });
        });
    }, 3000);
});
