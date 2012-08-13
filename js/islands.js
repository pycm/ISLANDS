var ISLANDS = (function() {

    var $wrapper = $('#islands'),
        islandsData = ISLANDS_Data,
        islandsNames = islandsData && Object.keys(islandsData),
        islandSpacingRatio = 0.25,
        smallIslandWidth,
        fullIslandWidth = 450,
        moduleDisabled = false,
        disableIslandMove = false;

    if (!$wrapper.length || !islandsData) {
        console.error('No required data for islands.');
        moduleDisabled = true;
    }

    function init() {
        var i, tmpl, catTmpl,
            $tmplNode = $('#island-template'),
            $catTmplNode = $('#island-category-template');

        if (!$tmplNode.length || !$catTmplNode.length) {
            console.error('No required template for islands.');
            moduleDisabled = true;
        }

        if (!moduleDisabled) {
            smallIslandWidth = islandsNames ? Math.floor($wrapper.width() / ((islandsNames.length + 1) * islandSpacingRatio + islandsNames.length)) : null;

            tmpl = Handlebars.compile($tmplNode.html());
            catTmpl = Handlebars.compile($catTmplNode.html());

            islandsNames.forEach(function(islandName) {
                var islandData = islandsData[islandName],
                    context = {
                        name: islandName,
                        title: islandData.display,
                        img: islandData.img
                    },
                    html = tmpl(context);

                islandData.domElem = $(html).appendTo($wrapper)[0];

                if (islandData.children) {
                    templateIslandCategories(islandData.children, catTmpl, $(islandData.domElem));
                }

                $(islandData.domElem).css({
                    width: smallIslandWidth,
                    left: (smallIslandWidth * islandSpacingRatio) + (islandData.position * smallIslandWidth * (1 + islandSpacingRatio))
                }).mouseenter(islandMoveHandler).click(islandRevealHandler);
            });

            initIslandCategories();

            initIslandCheckers();
        }
    }

    function templateIslandCategories(data, tmpl, $parent) {
        var context, itemHTML,
            catNames = Object.keys(data),
            $resHTML = $($('<ul class="island-categories"></ul>').appendTo($parent));

        catNames.forEach(function(catName) {
            context = {
                name: catName,
                img: 'images/catImg.png'
            };
            itemHTML = $(tmpl(context)).appendTo($resHTML);

            if (data[catName].children) {
                itemHTML.addClass('has-childrens');
                templateIslandCategories(data[catName].children, tmpl, itemHTML);
            }
        });
    }

    function getIslandDataByDom (domElem) {
        var result = false;

       islandsNames.forEach(function(islandName) {
           if (islandsData[islandName].domElem === domElem) {
               result = islandsData[islandName];
           }
       });

        return result;
    }

    function islandMoveHandler(e) {
        var islandDomElem = e.currentTarget,
            currentIsland = getIslandDataByDom(islandDomElem),
            islandsCount = islandsNames.length,
            middlePos = Math.ceil(islandsCount / 2) - 1,
            summaryIslandsWidth = smallIslandWidth * (islandsCount - 1) + fullIslandWidth,
            newIslandSpacing = ($wrapper.width() - summaryIslandsWidth) / (islandsCount + 1),
            direction = currentIsland.position === middlePos ? 0 : (currentIsland.position > middlePos ? 1 : -1);

        if (!disableIslandMove) {
            if (currentIsland.state > 0) {
                return;
            }

            islandsNames.forEach(function(islandName) {
                var islandData = ISLANDS_Data[islandName];

                if (currentIsland === islandData) {
                    islandData.currentPosition = middlePos;
                }
                else {
                    if (islandData.position === middlePos) islandData.currentPosition = islandData.position + direction;
                    if (islandData.position > middlePos) islandData.currentPosition = islandData.position + (direction === 1 && currentIsland.position > islandData.position ? 1 : 0);
                    if (islandData.position < middlePos) islandData.currentPosition = islandData.position + (direction === -1 && currentIsland.position < islandData.position ? -1 : 0);
                }
            });

            islandsNames.forEach(function(islandName) {
                var newLeft, animateObj,
                    islandData = ISLANDS_Data[islandName];

                if (islandData.currentPosition <= middlePos) newLeft = newIslandSpacing + islandData.currentPosition * (newIslandSpacing + smallIslandWidth);
                else newLeft = newIslandSpacing * 2 + fullIslandWidth + (islandData.currentPosition - 1) * (newIslandSpacing + smallIslandWidth);

                animateObj = {
                    left: newLeft
                };

                if (islandData === currentIsland) {
                    animateObj.width = fullIslandWidth;
                    islandData.state = 1;
                }
                else {
                    if (islandData.state > 0) {
                        animateObj.width = smallIslandWidth;
                    }

                    if (islandData.state === 2) {
                        $(islandData.domElem).find('.island-categories').removeClass('active');
                    }

                    islandData.state = 0;
                }

                $(islandData.domElem).animate(animateObj);
            });

            disableIslandMove = true;

            setTimeout(function() {
                disableIslandMove = false;
            }, 1000);
        }
    }

    function islandRevealHandler(e) {
        var islandDomElem = e.currentTarget,
            currentIsland = getIslandDataByDom(islandDomElem);

        if (currentIsland.state === 1) {
            openIsland(currentIsland);
        }
    }

    $(document).bind('click', function(e) {
        var islands,
            target = e.target,
            node = target,
            isIslandClick = false;

        while (node.nodeName.toUpperCase() !== 'BODY') {
            if ($(node).hasClass('island')) isIslandClick = true;

            node = node.parentNode;
        }

        if (!isIslandClick) {
            islandsNames.forEach(function(islandName) {
                var islandData = ISLANDS_Data[islandName],
                    animateObj = {
                        left: (smallIslandWidth * islandSpacingRatio) + (islandData.position * smallIslandWidth * (1 + islandSpacingRatio))
                    };

                if (islandData.state > 0) {
                    animateObj.width = smallIslandWidth;
                }

                if (islandData.state === 2) {
                    $(islandData.domElem).find('.island-categories').removeClass('active');
                }

                $(islandData.domElem).animate(animateObj);

                islandData.state = 0;
                islandData.currentPosition = islandData.position;
            });
        }
    });

    function openIsland(islandData) {

        // disable module handlers

        // 3D animation

        // enable module handlers

        islandData.state = 2;

        $(islandData.domElem).removeClass('island-small').addClass('island-full').children('.island-categories').addClass('active');
    }

    function initIslandCategories() {
        $('.island-categories li').bind('click', function(e) {
            var position,
                listLeft = 0,
                listTop = 0,
                $item = $(e.currentTarget),
                $node = $item,
                isFirstLevel = $item.parent().hasClass('active'),
                isSecondLevel = $item.parent().parent().parent().hasClass('active'),
                hasChildren = $item.hasClass('has-childrens');

            if ((isFirstLevel || isSecondLevel) && hasChildren) {
                $item.parents('.island-categories').removeClass('active');

                while ($node && $node.length && !$node.hasClass('island')) {
                    position = $node.position();
                    listLeft += position.left + parseInt($node.css('margin-left'));
                    listTop += position.top + parseInt($node.css('margin-top'));

                    $node = $node.offsetParent();
                }

                $item.children('.island-categories').addClass('active').css({
                    left: -listLeft + 15,
                    top: -listTop + 15
                });
            }

            e.stopPropagation();
        });
    }

    function initIslandCheckers() {
        $('.island-categories .category-checker').bind('click', function(e) {
            var isChecked, $currentChecker, $closestList, $parentChecker, $siblingCheckers, hasChecked, hasUnchecked,
                $checker = $currentChecker = $(e.currentTarget),
                $lowerCheckers = $checker.parent().find('.island-categories .category-checker');

                setTimeout(function() {
                    isChecked = $checker.hasClass('checked');

                    $checker.removeClass('partial');

                    if (isChecked) $lowerCheckers.addClass('checked');
                    else $lowerCheckers.removeClass('checked');

                    while ($currentChecker.parents('.island-categories').length > 1) {
                        $closestList = $currentChecker.parents('.island-categories').eq(0);
                        $parentChecker = $closestList.siblings('.category-checker');

                        $siblingCheckers = $closestList.children('li').children('.category-checker');

                        $siblingCheckers.each(function(ind, checker) {
                            if ($(checker).hasClass('checked')) hasChecked = true;
                            else hasUnchecked = true;
                        });

                        if (hasChecked && hasUnchecked) $parentChecker.addClass('checked partial');
                        else if (hasChecked) $parentChecker.addClass('checked').removeClass('partial');
                        else $parentChecker.removeClass('checked partial');

                        $currentChecker = $parentChecker;
                    }
                }, 0);

                e.stopPropagation();
        });
    }

    return {
        init: init
    }

})();