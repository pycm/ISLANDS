var FILTERS = (function() {
    var filterTypes = {},
        filters = [];

    function init() {
        initDocumentEventDelegation();
    }

    function create(data) {
        var filterObj,
            typeProto = filterTypes[data.type];

        if (typeProto) {
            filterObj = Object.create(typeProto);
            filterObj.init(data);
            filters.push(filterObj);
        }
        else {
            return false;
        }
    }

    function decl(type, typeObj) {
        filterTypes[type] = typeObj;
    }

    function initDocumentEventDelegation() {
        $(document).bind('click', function(e) {
            var $target = $(e.target);

            if ($target.hasClass('filter-switcher')) {
                $target.parents('.filter').eq(0).toggleClass('opened');
                e.preventDefault();
            }
            else if ($target.hasClass('filter-close')) {
                resetFilter(getFilterByDom($target.parents('.filter')[0]), $target.parents('.filter').eq(0).hasClass('filter-type-catalog'));
                e.preventDefault();
            }
        });
    }

    function applyFilter(filter, first) {
        var filterDOM = filter.domElem,
            $filter = $(filterDOM);

        if ($filter.hasClass('filter-possible')) {
            $filter.removeClass('filter-possible').addClass('filter-applied');
            $('.filters-applied')[first ? 'prepend' : 'append'](filterDOM);
        }
    }

    function resetFilter(filter, first) {
        var filterDOM = filter.domElem,
            $filter = $(filterDOM);

        if ($filter.hasClass('filter-applied')) {
            $filter.removeClass('filter-applied opened').addClass('filter-possible');
            filter.clear && filter.clear();
            $('.filters-possible')[first ? 'prepend' : 'append'](filterDOM);
        }
    }

    function getFilterByDom(domElem) {
        var result = false;

        filters.forEach(function(filter) {
            if (filter.domElem === domElem) result = filter;
        });

        return result;
    }

    return {
        init: init,
        create: create,
        decl: decl,
        applyFilter: applyFilter,
        resetFilter: resetFilter ,
        getFilterByDom: getFilterByDom
    }

})();



$(function() {
    var $tmplNode = $('#filter-range'),
        tmpl = Handlebars.compile($tmplNode.html());

    FILTERS.decl('range', {

        init: function(data) {
            this.title = data.title || '';
            this.enabled = !!data.enabled;
            this.applied = !!data.applied;
            this.found = data.found || 0;
            this.from = (data.value && data.value.from) ? +data.value.from : 0;
            this.to = (data.value && data.value.to) ? +data.value.to : 100;

            this.domElem = this.template();

            $(this.domElem).addClass('opened');
            this.initJS();
            $(this.domElem).removeClass('opened');
        },

        template: function() {
            var degree = (this.to - this.from) / 4,
                context = {
                    title: this.title,
                    v1: this.from + '£',
                    v2: parseInt(degree) + this.from + '£',
                    v3: parseInt(degree * 2) + this.from + '£',
                    v4: parseInt(degree * 3) + this.from + '£',
                    v5: parseInt(degree * 4) + this.from + '£'
                },
                html = tmpl(context);

            return $(html).appendTo('.filters-possible')[0];
        },

        initJS: function() {
            var filterOffset,
                self = this,
                $wrapper = $(this.domElem),
                min = this.from,
                max = this.to,
                $title = $wrapper.find('.title'),
                $form = $wrapper.children('.filter-form'),
                $slider = $form.children('.slider'),
                $leftPointer = $slider.children('.left-pointer'),
                $rightPointer = $slider.children('.right-pointer'),
                $selectedArea = $slider.children('.selected-area'),
                $leftInput = $form.find('.from-input'),
                $rightInput = $form.find('.to-input'),
                $clear = $form.children('.clear'),
                pixelsPerValue = $slider.width() / (max - min),
                availableCoords = {
                    min: -3,
                    max: $slider.width() - 3
                },
                storage = {
                    state: null,
                    activePointer: null,
                    cursorShift: null
                };

            $leftPointer.add($rightPointer).on('selectstart dragstart', false).on('mousedown touchstart', function(e) {
                var $pointer = $(e.currentTarget),
                    pointerType = getPointerTypeByDOM($pointer),
                    pointerOffset = $pointer.offset();

                filterOffset = $slider.offset();

                storage.cursorShift = e.pageX - pointerOffset.left;
                storage.state = 1;
                storage.activePointer = pointerType;

                return false;
            })

            $(document).on('mousemove', function(e) {
                var pointerType, newLeft;

                if (storage.state === 1) {
                    pointerType = storage.activePointer;
                    newLeft = e.pageX - storage.cursorShift - filterOffset.left;

                    setPointerByPixels(newLeft, pointerType, true);
                }

                return false;
            }).on('mouseup touchend', function(e) {
                if (storage.state === 1) {
                    storage.state = 0;
                    storage.activePointer = null;
                    storage.cursorShift = null;
                }
            });

            function setPointerByPixels(newLeft, pointerType, updateInput) {
                var leftPointerFullOffset,    // !!!
                    $pointer = getPointerDOMByType(pointerType),
                    $input = getPointerInputByType(pointerType),
                    minLeft = pointerType === 'left' ? availableCoords.min : $leftPointer.position().left + $leftPointer.width() + 3,
                    maxLeft = pointerType === 'right' ? availableCoords.max : $rightPointer.position().left - $leftPointer.width() - 3;

                if (newLeft < minLeft) newLeft = minLeft;
                else if (newLeft > maxLeft) newLeft = maxLeft;

                $pointer.css('left', newLeft);

                updateInput && $input.val(pixelsToPoints(newLeft));

                leftPointerFullOffset = $leftPointer.position().left + $leftPointer.width();
                $selectedArea.css({
                    left: leftPointerFullOffset,
                    width: $rightPointer.position().left - leftPointerFullOffset
                });

                updateTitle();

                if (updateInput) {
                    FILTERS.applyFilter(self);
                }
            }

            $leftInput.add($rightInput).on('change', function(e) {
                var $input = $(e.target),
                    val = $input.val(),
                    pointerType = getPointerTypeByInput($input),
                    updateInput = val !== '' ? true : false;

                if (!val || !$.isNumeric(val)) val = pointerType === 'left' ? min : max;

                setPointerByPixels(pointsToPixels(val), pointerType, updateInput);
            });

            function clear() {
                $wrapper.addClass('opened');
                $leftInput.val('');
                $rightInput.val('');
                setPointerByPixels(pointsToPixels(min), 'left', false);
                setPointerByPixels(pointsToPixels(max), 'right', false);
                $wrapper.removeClass('opened');

                FILTERS.resetFilter(self);

                return false;
            }

            self.clear = clear;

            $clear.click(clear);

            function updateTitle() {
                var titleStr = self.title,
                    fromVal = $leftInput.val(),
                    toVal =  $rightInput.val();

                if (fromVal && $.isNumeric(fromVal)) titleStr += ' from £' + fromVal;
                if (toVal && $.isNumeric(toVal)) titleStr += ' to £' + toVal;
                if (!fromVal && !toVal) titleStr += ' range';

                $title.html(titleStr);
            }

            function getPointerTypeByDOM($elem) {
                return $elem.hasClass('left-pointer') ? 'left' : 'right';
            }

            function getPointerTypeByInput($input) {
                return $input.hasClass('from-input') ? 'left' : 'right';
            }

            function getPointerDOMByType(type) {
                return type === 'left' ? $leftPointer : $rightPointer;
            }

            function getPointerInputByType(type) {
                return type === 'left' ? $leftInput : $rightInput;
            }

            function pixelsToPoints(pixels) {
                return parseInt(pixels / pixelsPerValue + min);
            }

            function pointsToPixels(points) {
                return parseInt((points - min) * pixelsPerValue);
            }
        }

    });

});

$(function() {
    var $tmplNode = $('#filter-list'),
        tmpl = Handlebars.compile($tmplNode.html());

    FILTERS.decl('list', {

        init: function(data) {
            this.title = data.title || '';
            this.enabled = !!data.enabled;
            this.applied = !!data.applied;
            this.found = data.found || 0;
            this.items = data.value || [];

            this.domElem = this.template();

            $(this.domElem).addClass('opened');
            this.initJS();
            $(this.domElem).removeClass('opened');
        },

        template: function() {
            var html, list,
                items = this.items,
                context = {
                    title: this.title,
                    lists: []
                };

            var iter = 0;
            while ((list = items.splice(0, 5)).length) {
                context.lists.push({
                    items: list.map(function(item) {
                        return {
                            name: '', // TODO name и value
                            value: '',
                            text: item.opt,
                            count: item.found
                        }
                    })
                });
            }

            html = tmpl(context);

            return $(html).appendTo('.filters-possible')[0];
        },

        initJS: function() {
            // TODO: разобраться с шириной title, нужно ли ее развигать автоматом, нужно ли ограничение в 3?

            var self = this,
                $filter = $(this.domElem),
                $checkers = $filter.find('form input');

            $checkers.bind('click', updateTitle);

            $filter.find('.clear').bind('click', clear);

            function clear(e) {
                $checkers.removeAttr('checked');

                updateTitle();

                FILTERS.resetFilter(self);

                return false;
            }

            self.clear = clear;

            function updateTitle(e) {
                var title = self.title + ': ',
                    count = 0;

                $checkers.each(function(ind, checker) {
                    if (checker.checked) {
                        count++;
                        if (count <= 3) title += $(checker).parent().text().trim() + ', ';
                        else if (count === 4) title = title.substr(0, title.length - 2) + ' ...';
                    }
                });

                if (count > 0) FILTERS.applyFilter(self);
                else FILTERS.resetFilter(self);

                if (count <= 3) title = title.substr(0, title.length - 2);

                $filter.find('.title').text(title);
            }
        }

    });

});

$(function() {
    var $tmplNode = $('#filter-trigger'),
        tmpl = Handlebars.compile($tmplNode.html());

    FILTERS.decl('trigger', {

        init: function(data) {
            this.title = data.title || '';
            this.enabled = !!data.enabled;
            this.applied = !!data.applied;
            this.found = data.found || 0;
            this.value = data.value || '';

            this.domElem = this.template();

            $(this.domElem).addClass('opened');
            this.initJS();
            $(this.domElem).removeClass('opened');
        },

        template: function() {
            var context = {
                    title: this.title,
                    name: '', // FIXME
                    value: this.value,
                    count: this.found
                },
                html = tmpl(context);

            return $(html).appendTo('.filters-possible')[0];
        },

        initJS: function() {
            var self = this,
                $trigger = $(this.domElem).find('.trigger');

            $trigger.bind('click', function(e) {
                var checker = e.target;

                if (checker.checked) FILTERS.applyFilter(self);
                else FILTERS.resetFilter(self);
            });

            self.clear = function() {
                $trigger.removeAttr('checked');
            }
        }

    });

});

$(function() {
    var $tmplNode = $('#filter-catalog'),
        $tmplListNode = $('#filter-catalog-list'),
        tmpl = Handlebars.compile($tmplNode.html()),
        tmplList = Handlebars.compile($tmplListNode.html());

    FILTERS.decl('catalog', {

        init: function(data) {
            this.title = 'Catalog';
            this.enabled = true; // FIXME
            this.applied = true; // FIXME
            this.found = 0; // FIXME
            this.list = data.list;

            this.domElem = this.template();

            $(this.domElem).addClass('opened');
            this.initJS();
            $(this.domElem).removeClass('opened');
        },

        template: function() {
            var context = {
                    title: this.title,
                    list: this.templateCategories(this.list, 1)
                },
                html = tmpl(context);

            return $(html).prependTo('.filters-possible')[0];
        },

        templateCategories: function(data, level) {
            var self = this,
                result = '';

            if (data) {
                result = tmplList({
                    level: level,
                    categories: Object.keys(data).map(function(cKey) {
                        var cData = data[cKey];

                        return {
                            title: cData.name,
                            count: cData.p_count || 0,
                            children: self.templateCategories(cData['#children'], level + 1)
                        };
                    })
                });
            }

            return new Handlebars.SafeString(result);
        },

        initJS: function() {
            var self = this,
                w = 0,
                h = 0;

            $(self.domElem).find('.filter-form .catalog-list-level-1 > li').each(function(ind, item) {
                w += $(item).outerWidth();
                h = Math.max(h, $(item).height());
            }).height(h);

            $(this.domElem).find('.filter-switcher').bind('click', function(e) {
                var w = 0;

                setTimeout(function() {
                    $(self.domElem).find('.filter-form .catalog-list-level-1 > li').each(function(ind, item) {
                        w += $(item).outerWidth();
                    });

                    $(self.domElem).find('.filter-form').css({
                        width: w + 30
                    });
                }, 0);
            });

            $(this.domElem).find('.catalog-list .checker').on('click', function(e) {
                var isChecked, $currentChecker, $closestList, $parentChecker, $siblingCheckers,
                    $checker = $currentChecker = $(e.currentTarget),
                    $lowerCheckers = $checker.parents('li').eq(0).find('.catalog-list .checker');

                setTimeout(function() {
                    isChecked = $checker.hasClass('checked');

                    $checker.removeClass('partial');

                    if (isChecked) $lowerCheckers.addClass('checked');
                    else $lowerCheckers.removeClass('checked');

                    while ($currentChecker.parents('.catalog-list').length > 1) {
                        $closestList = $currentChecker.parents('.catalog-list').eq(0);
                        $parentChecker = $closestList.siblings('.catalog-list-item').children('.checker');

                        $siblingCheckers = $closestList.children('li').children('.catalog-list-item').children('.checker');

                        checkSiblings($siblingCheckers, $parentChecker);

                        $currentChecker = $parentChecker;
                    }

                    updateTitle();
                }, 0);
            });

            function checkSiblings ($siblingCheckers, $parentChecker) {
                var hasChecked = false,
                    hasUnchecked = false;

                $siblingCheckers.each(function(ind, checker) {
                    if ($(checker).hasClass('checked')) hasChecked = true;
                    else hasUnchecked = true;
                });

                if (hasChecked && hasUnchecked) $parentChecker.addClass('checked partial');
                else if (hasChecked) $parentChecker.addClass('checked').removeClass('partial');
                else $parentChecker.removeClass('checked partial');
            }

            function updateTitle() {
                var texts = [],
                    $baseList = $(self.domElem).find('.catalog-list-level-1 > li');

                checkListForTitle($baseList, texts);

                if (texts.length === 0) {
                    texts = ['Catalog'];
                    FILTERS.resetFilter(self, true);
                }
                else {
                    if (texts.length > 3) {
                        (texts = texts.splice(0, 3)).push('...');
                    }
                    FILTERS.applyFilter(self, true);
                }

                $(self.domElem).find('.title-wrapper .title').text(texts.join(', '));
            }

            function checkListForTitle($list, texts) {
                $list.each(function(ind, elem) {
                    var $elem = $(elem),
                        $listItem = $elem.children('.catalog-list-item'),
                        $children = $elem.children('.catalog-list'),
                        $checker = $listItem.children('.checker'),
                        $title = $listItem.children('.title');

                    if ($checker.hasClass('checked')) {
                        if ($checker.hasClass('partial')) {
                            if ($children.length) {
                                checkListForTitle($children.children('li'), texts);
                            }
                        }
                        else {
                            texts.push($title.text());
                        }
                    }
                });
            }

            function clear() {
                $(self.domElem).find('.checker').removeClass('checked partial');
                updateTitle();

                return false;
            }

            this.clear = clear;

            $(this.domElem).find('.clear').on('click', clear);
        }

    });

});
