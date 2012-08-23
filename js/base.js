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

$.post('http://193.161.193.147/ajax/quick_search', {
    keywords: 'techno',
    categories: [10, 25]
}, function(data, textStatus, jqXHR) {
    console.log(data);
});
