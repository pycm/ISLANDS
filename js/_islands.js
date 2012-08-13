/*
    TODO:
        - ECMA fallbacks (underscore?)
        - подобрать нормальные цвета
 */


var ISLANDS = (function() {

    var tmpl,
        $wrapper = $('#islands');

    function init() {
        var i,
            $tmplNode = $('#island-template'),
            islands = ISLANDS.Data && Object.keys(ISLANDS.Data),
            islandSpacing = 0.6,
            islandWidth = islands ? Math.floor($wrapper.width() / ((islands.length + 1) * islandSpacing + islands.length)) : null;

        // console.log('Init: start');

        // console.log('Init: island width');
        // console.log(islandWidth);

        if (!$wrapper.length || !$tmplNode.length) {
            console.error('Required dom elements for islands are missing.');
            return false;
        }

        if (!ISLANDS.Data || !islands) {
            console.error('No data for Islands');
            return false;
        }

        tmpl = Handlebars.compile($tmplNode.html());

        islands.forEach(function(island) {
            var islandData = ISLANDS.Data[island],
                departments = ISLANDS.Data[island].departments,
                depList = departments ? Object.keys(departments) : null,
                context = {
                    name: island,
                    title: islandData.display,
                    departments: depList ? depList.map(function(depName) {
                        var categories = departments[depName].categories ? Object.keys(departments[depName].categories) : null;

                        return {
                            categories: categories ? categories.map(function() {
                                return '';
                            }) : null
                        }
                    }) : []
                },
                html = tmpl(context);

            // console.log('Init: template html');
            // console.log(html);

            islandData.domElem = $(html).appendTo($wrapper)[0];

            $(islandData.domElem).children('.island').css({
                backgroundColor: islandData.color
            }).click(function(e) {
                var fullIslandsWidth, newIslandSpacing, fullIslandWidth, currentIsland,
                    islandDomElem = $(e.target).parents('.island-wrapper')[0],
                    islands = Object.keys(ISLANDS.Data),
                    islandsCount = islands.length,
                    middlePos = Math.ceil(islandsCount / 2) - 1,
                    intermediateIslandsWidth = islandWidth * (islandsCount - 1);

                // console.log('Start');
                // console.log('islandDomElem:', islandDomElem);
                // console.log('middlePos:', middlePos);

                islands.forEach(function(island) {
                    var islandData = ISLANDS.Data[island];

                    if (islandData.domElem === islandDomElem) {
                        fullIslandsWidth = intermediateIslandsWidth + islandData.fullWidth;
                        fullIslandWidth = islandData.fullWidth;
                        currentIsland = islandData;
                    }
                });

                if (currentIsland.state === 1) {
                    $(currentIsland.domElem).addClass('opened');
                    return;
                }

                islands.forEach(function(island) {
                    var islandData = ISLANDS.Data[island],
                        direction = currentIsland.position === middlePos ? 0 : (currentIsland.position > middlePos ? 1 : -1);

                    if (currentIsland === islandData) {
                        islandData.currentPosition = middlePos;
                    }
                    else {
                        if (islandData.position === middlePos) islandData.currentPosition = islandData.position + direction;
                        if (islandData.position > middlePos) islandData.currentPosition = islandData.position + (direction === 1 && currentIsland.position > islandData.position ? 1 : 0);
                        if (islandData.position < middlePos) islandData.currentPosition = islandData.position + (direction === -1 && currentIsland.position < islandData.position ? -1 : 0);
                    }

                    newIslandSpacing = ($wrapper.width() - fullIslandsWidth) / (islandsCount + 1);
                });

                // console.log('fullIslandsWidth:', fullIslandsWidth);
                // console.log('newIslandSpacing:', newIslandSpacing);

                islands.forEach(function(island) {
                    var newLeft, animateObj,
                        islandData = ISLANDS.Data[island];

                    if (islandData.currentPosition <= middlePos) newLeft = newIslandSpacing + islandData.currentPosition * (newIslandSpacing + islandWidth);
                    else newLeft = newIslandSpacing * 2 + fullIslandWidth + (islandData.currentPosition - 1) * (newIslandSpacing + islandWidth);

                    animateObj = {
                        left: newLeft
                    };

                    if (islandData.domElem === islandDomElem) {
                        animateObj.width = fullIslandWidth;
                        animateObj.height = 300; //fullIslandWidth * 1.35;
                        islandData.state = 1;
                    }
                    else {
                        if (islandData.state == 1) {
                            animateObj.width = islandWidth;
                            animateObj.height = islandWidth * 1.35
                        }
                        islandData.state = 0;

                        if ($(islandData.domElem).hasClass('opened')) {
                            $(islandData.domElem).find('island-departments').removeClass('animated');
                            setTimeout(function() {
                                $(islandData.domElem).removeClass('opened');
                                $(islandData.domElem).find('island-departments').addClass('animated');
                            }, 50);
                        }
                    }

                    $(islandData.domElem).animate(animateObj);
                });
            });

            $(document).click(function(e) {
                var islands,
                    target = e.target,
                    node = target,
                    isIslandClick;

                while (node.nodeName.toUpperCase() !== 'BODY') {
                    if ($(node).hasClass('island')) isIslandClick = true;

                    node = node.parentNode;
                }

                if (!isIslandClick) {
                    islands = Object.keys(ISLANDS.Data);

                    islands.forEach(function(island) {
                        var islandData = ISLANDS.Data[island],
                            animateObj = {
                                left: (islandWidth * islandSpacing) + (islandData.position * islandWidth * (1 + islandSpacing))
                            };

                        if (islandData.state === 1) {
                            animateObj.width = islandWidth;
                            animateObj.height = islandWidth * 1.35
                        }

                        if ($(islandData.domElem).hasClass('opened')) {
                            $(islandData.domElem).find('island-departments').removeClass('animated');
                            setTimeout(function() {
                                $(islandData.domElem).removeClass('opened');
                                $(islandData.domElem).find('island-departments').addClass('animated');
                            }, 50);
                        }

                        $(islandData.domElem).animate(animateObj);

                        islandData.state = 0;
                        islandData.currentPosition = islandData.position;
                    });
                }
            });

            resizeIsland(island, islandWidth, islandSpacing);
        });
    }

    function resizeIsland(island, islandWidth, islandSpacing) {
        $(ISLANDS.Data[island].domElem).css({
            width: islandWidth,
            height: islandWidth * 1.35,
            left: (islandWidth * islandSpacing) + (ISLANDS.Data[island].position * islandWidth * (1 + islandSpacing))
        });
    }

    return {
        init: init
    };

}());

ISLANDS.Data = {
    island1: {
        position: 0,
        currentPosition: 0,
        fullWidth: 255,
        color: 'red',
        display: 'Island 1',
        domElem: null,
        state: 0,
        departments: {
            dep1: {
                categories: {
                    cat1: {},
                    cat2: {},
                    cat3: {},
                    cat4: {},
                    cat5: {},
                    cat6: {}
                }
            },
            dep2: {
                categories: {
                    cat1: {},
                    cat2: {},
                    cat3: {},
                    cat4: {},
                    cat5: {},
                    cat6: {},
                    cat7: {},
                    cat8: {},
                    cat9: {},
                    cat10: {}
                }
            },
            dep3: {
                categories: {
                    cat1: {},
                    cat2: {},
                    cat3: {},
                    cat4: {},
                    cat5: {}
                }
            },
            dep4: {
                categories: {
                    cat1: {},
                    cat2: {},
                    cat3: {},
                    cat4: {},
                    cat5: {},
                    cat6: {},
                    cat7: {}
                }
            }
        }
    },
    island2: {
        position: 1,
        currentPosition: 1,
        fullWidth: 255,
        color: 'blue',
        display: 'Island 2',
        domWrapper: null,
        state: 0,
        departments: {
            dep1: {},
            dep2: {},
            dep3: {},
            dep4: {},
            dep5: {},
            dep6: {}
        }
    },
    island3: {
        position: 2,
        currentPosition: 2,
        fullWidth: 255,
        color: 'green',
        display: 'Island 3',
        domWrapper: null,
        state: 0,
        departments: {
            dep1: {},
            dep2: {},
            dep3: {},
            dep4: {}
        }
    },
    island4: {
        position: 3,
        currentPosition: 3,
        fullWidth: 255,
        color: 'yellow',
        display: 'Island 4',
        domWrapper: null,
        state: 0,
        departments: {
            dep1: {},
            dep2: {},
            dep3: {},
            dep4: {},
            dep5: {}
        }
    }
};

/*$(function() {
    setTimeout(function() {
        $('.checkbox-wrapper').each(function(ind, wrapper) {
            $(wrapper).click(function(e) {
                $(wrapper).toggleClass('checked');
            });
        });
    }, 50);
});*/

$(function() {
    $(document.body).click(function(e) {
        var $checker, isDepChecker, isCatChecker, isChecked, $catCheckers, $parentChecker, hasChecked, hasUnchecked,
            $node = $(e.target);

        while (!$node.is('body')) {
            if ($node.hasClass('department-checker')) {
                isDepChecker = true;
            }
            else if ($node.hasClass('category-checker')) {
                isCatChecker = true;
            }

            if (isDepChecker || isCatChecker) {
                $checker = $node;
                isChecked = $checker.hasClass('checked');
                break;
            }
            else {
                $node = $node.parent();
            }
        }

        if (isDepChecker || isCatChecker) {
            $checker.toggleClass('checked');

            if (isDepChecker) {
                $catCheckers = $checker.parent().find('.category-checker');
                if (isChecked) $catCheckers.removeClass('checked');
                else $catCheckers.addClass('checked');
                $checker.removeClass('partial');
            }
            else {
                $catCheckers = $checker.parents('.island-categories').find('.category-checker');
                $parentChecker = $checker.parents('.island-categories').prev(),
                parentCbState = 0;
                $catCheckers.each(function(ind, checker) {
                    var $checker = $(checker);

                    if ($checker.hasClass('checked')) hasChecked = true;
                    else hasUnchecked = true;
                });

                if (hasChecked && hasUnchecked) $parentChecker.addClass('checked partial');
                else if (hasChecked) $parentChecker.addClass('checked').removeClass('partial');
                else $parentChecker.removeClass('checked partial');
            }
        }
    });
});