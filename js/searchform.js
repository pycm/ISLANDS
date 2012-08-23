/*
    TODO:
        - debounce
        - keyup
        - только последний результат
        - outerClick
 */

var SEARCH = (function() {
    var $suggestBox, $searchInput, listTmtl;

    function init() {
        var $listTmplNode = $('#search-suggest-box-list');

        $suggestBox = $('.search-suggest-box');
        $searchInput = $('#search-form .form-text');
        listTmtl = Handlebars.compile($listTmplNode.html());

        $searchInput.keyup(function(e) {
            var $target = $(e.target),
                text = $target.val();

            if (text) {
                $.ajax('http://193.161.193.147/ajax/quick_search', {
                    dataType: 'jsonp',
                    jsonpCallback: 'quickSearch',
                    type: 'POST',
                    data: {
                        keywords: text,
                        categories: DLIST.getSelectedDepartments()
                    },
                    success: function(data, textStatus, jqXHR) {
                        // TODO: typeError quickSearch is not a function

                        if (data && Object.keys(data).length) {
                            showSuggest(data);
                        }
                        else {
                            hideSuggest();
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        hideSuggest();
                    }
                });
            }
            else {
                hideSuggest();
            }

            $(document).on('click', function(e) { // document || document.body ?
                var target = e.target,
                    parent = target;

                while (parent !== document.body) {
                    if (parent.className === 'search-suggest-box') {
                        return;
                    }
                    parent = parent.parentNode;
                }

                hideSuggest();
            });
        });
    }

    function showSuggest(data) {
        var html,
            inputOffset = $searchInput.offset(),
            context = {
                products: []
            };

        Object.keys(data).forEach(function(productKey) {
            var product = data[productKey];

            context.products.push({
                imgSrc: 'http://193.161.193.147/' + product.img_src,
                imgAlt: 'http://193.161.193.147/' + product.img_alt,
                title: product.name,
                price: product.price
            });
        });

        html = listTmtl(context);

        $suggestBox.children('ul').remove();
        $suggestBox.prepend(html);

        $suggestBox.css({
            top: inputOffset.top + $searchInput.outerHeight(),
            left: inputOffset.left
        });

        $suggestBox.show();
    }

    function hideSuggest() {
        $suggestBox.hide();
    }

    return {
        init: init
    };
})();



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

        $popup.find('input').on('click', updateDepartments);
        $popup.children('.clear').on('click', function(e) {
            $popup.find('input').removeAttr('checked');
            updateDepartments();
            e.preventDefault();
        });

        $(document).on('click', function(e) {
            var target = e.target,
                parent = target;

            while (parent !== document.body) {
                if (parent.className === 'dlist-popup' || parent.className === 'categories-select-button') {
                    return;
                }
                parent = parent.parentNode;
            }

            $popup.hide();
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

    function getSelectedDepartments() {
        var result = [];

        $popup.find('input').each(function(ind, input) {
            if (input.checked) {
                result.push(input.value);
            }
        });

        return result;
    }

    return {
        init: init,
        getSelectedDepartments: getSelectedDepartments
    }

})();