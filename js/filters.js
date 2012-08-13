$(function() {
    $('.filter-applied-type-multiple').each(function(ind, filterDOM) {
        var $filter = $(filterDOM),
            $checkers = $filter.find('form input');

        $checkers.click(updateTitle);
        updateTitle();

        $filter.find('.clear').click(function(e) {
            $checkers.removeAttr('checked');
            updateTitle();

            return false;
        });

        function updateTitle(e) {
            var title = 'discount: ',
                count = 0;

            $checkers.each(function(ind, checker) {
                if (checker.checked) {
                    count++;
                    if (count <= 3) title += $(checker).parent().text().trim() + ', ';
                    else if (count === 4) title = title.substr(0, title.length - 2) + '...';
                }
            });

            if (count > 0 && count <= 3) title = title.substr(0, title.length - 2);

            $filter.children('.title').text(title);
        }
    });
});