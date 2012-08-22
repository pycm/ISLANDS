var DLIST = (function() {
    var $popup,
        $button = $('.categories-select-button'),
        texts = {
            base: 'in all categories',
            category: 'in %%',
            categories: 'in %% categories'
        };

    function init(data) {
        $popup = $(templatePopup(data));

        $button.on('click', function(e) {
            alignPopup();
            $popup.toggle();
        });

        //$(document).on('click', function(e) {
        //    $popup.hide();
        //});

        $popup.find('input').on('click', updateDepartments);
        $popup.children('.clear').on('click', function(e) {
            $popup.find('input').removeAttr('checked');
            updateDepartments();
            e.preventDefault();
        });
    }

    function templatePopup(data) {
        var html,
            departments = [],
            $tmplNode = $('#dlist-popup'),
            tmpl = Handlebars.compile($tmplNode.html());

        Object.keys(data).forEach(function(iKey) {
            var iData = data[iKey],
                children = iData['#children'];

            if (children) {
                Object.keys(children).forEach(function(dKey) {
                    var dData = children[dKey];

                    departments.push({
                        id: dKey,
                        text: dData.name
                    });
                });
            }
        });

        html = tmpl({
            departments: departments
        });

        return $(html).appendTo('body')[0];
    }

    function alignPopup() {
        var buttonOffset = $button.offset();

        $popup.css({
            top: buttonOffset.top + $button.outerHeight(),
            left: buttonOffset.left + $button.outerWidth() - $popup.outerWidth() - 1
        });
    }

    function updateDepartments() {
        var $departments = $popup.find('input'),
            $title = $button.children('span'),
            lastCheckedText = '',
            checkedLength = 0;

        $departments.each(function(ind, elem) {
            if (elem.checked) {
                checkedLength++;
                lastCheckedText = $(elem.parentNode).children('span').text();
            }
        });

        if (checkedLength === 0) $title.text(texts.base);
        else if (checkedLength === 1) $title.text(texts.category.replace('%%', lastCheckedText));
        else $title.text(texts.categories.replace('%%', checkedLength));
    }

    return {
        init: init
    }

})();