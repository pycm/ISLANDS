var ISLANDS = (function() {

    var $wrapper = $('#islands'),
        islandsData = null,
        islandsNames = null,
        islandSpacingRatio = 0.25,
        middleIslandWidth = null,
        smallIslandWidth = null,
        middleIslandTop = null,
        fullIslandWidth = 450,
        disableIslandMove = false,
        inited = false;

    if (!$wrapper.length) {
        console.error('No $wrapper for islands.');
    }
    else {
        APP.Subscribe('Islands:init', function(data) {
            var Data = preprocessData(data);

            islandsData = Data;
            islandsNames = Object.keys(islandsData);

            init();
            inited = true;
        });

        setTimeout(function() {
         //   if (!inited) $wrapper.append('<img class="loader" src="images/loader.gif" alt="Loading ...">');
        }, 1000);

        APP.Subscribe('hideLoader', function() {
            $wrapper.children('.loader').remove();
        })
    }

    function preprocessData(data) {
        var result = {},
            islandKeys = Object.keys(data),
            images = {
                2: 'images/islands/techno.png',
                4: 'images/islands/home.png',
                5: 'images/islands/hobby.png',
                6: 'images/islands/garden.png'
            };

        islandKeys.forEach(function(iKey, ind) {
            var iData = data[iKey];

            result[iKey] = {
                position: ind,
                currentPosition: ind,
                display: iData.name || '',
                domElem: null,
                state: 0,
                img: images[iKey],
                description: iData.description || ''
            }

            if (iData['#children']) preprocessChildren(iData['#children'], result[iKey]);
        });

        function preprocessChildren(data, result) {
            var cList,
                childrenKeys = Object.keys(data);

            if (childrenKeys.length) {
                cList = result.children = {};
                childrenKeys.forEach(function(cKey) {
                    var cData = data[cKey];

                    cList[cKey] = {
                        display: cData.name || '',
                        description: cData.description || '',
                        img: cData.img ? 'http://193.161.193.147/' + cData.img : 'images/defaultCategory.png'
                    }

                    if (cData['#children']) preprocessChildren(cData['#children'], cList[cKey]);
                });
            }
        }

        return result;
    }

    function init() {
        var i, tmpl, catTmpl,
            $tmplNode = $('#island-template'),
            $catTmplNode = $('#island-categories-template');

        if (!$tmplNode.length || !$catTmplNode.length) {
            console.error('No required template for islands.');
        }

        middleIslandWidth = islandsNames ? Math.floor($wrapper.width() / ((islandsNames.length + 1) * islandSpacingRatio + islandsNames.length)) : null;
        middleIslandTop = 90; //($wrapper.height() - middleIslandWidth * 0.6) / 2;
        smallIslandWidth = middleIslandWidth * 0.8;

        tmpl = Handlebars.compile($tmplNode.html());
        catTmpl = Handlebars.compile($catTmplNode.html());

        islandsNames.forEach(function(islandName) {
            var islandData = islandsData[islandName],
                context = {
                    name: islandName,
                    title: islandData.display,
                    img: islandData.img,
                    children: templateIslandCategories(islandData.children, catTmpl)
                },
                html = tmpl(context);

            islandData.domElem = $(html).appendTo($wrapper)[0];

            $(islandData.domElem).css({
                width: middleIslandWidth,
                left: (middleIslandWidth * islandSpacingRatio) + (islandData.position * middleIslandWidth * (1 + islandSpacingRatio)),
                top: middleIslandTop
            })/*.mouseenter(islandEnterHandler).mouseleave(islandLeaveHandler)*/.click(islandClickHandler);
        });

        // initIslandCategories();

        initIslandCheckers();

        initOceanClick();

        // initDepartmentsAlign();

        initCategoriesAlign();
    }

    function templateIslandCategories(data, tmpl) {
        var cKeys,
            result = '';

        if (data) {
            result = tmpl({
                categories: Object.keys(data).map(function(cKey) {
                    var cData = data[cKey];

                    return {
                        name: cKey,
                        img: cData.img,
                        'island-categories': templateIslandCategories(cData.children, tmpl)
                    };
                })
            });
        }

        return new Handlebars.SafeString(result);
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

    /*function islandEnterHandler(e) {
        var islandDomElem = e.currentTarget,
            currentIsland = getIslandDataByDom(islandDomElem);

        currentIsland.enterTimer = setTimeout(function() {
            if (!disableIslandMove) {

                if (currentIsland.state > 0) {
                    return;
                }

                disableIslandMove = true;

                islandSelect(currentIsland);

                setTimeout(function() {
                    disableIslandMove = false;
                }, 30);
            }
        }, 1000);
    }

    function islandLeaveHandler(e) {
        var islandDOM = e.currentTarget,
            islandData = getIslandDataByDom(islandDOM);

        clearTimeout(islandData.enterTimer);
    }*/

    function islandSelect(currentIsland) {
        var islandsCount = islandsNames.length,
            middlePos = Math.ceil(islandsCount / 2) - 1,
            summaryIslandsWidth = smallIslandWidth * (islandsCount - 1) + fullIslandWidth,
            newIslandSpacing = ($wrapper.width() - summaryIslandsWidth) / (islandsCount + 1),
            direction = currentIsland.position === middlePos ? 0 : (currentIsland.position > middlePos ? 1 : -1);

        disableIslandMove = true;

        islandsNames.forEach(function(islandName) {
            var islandData = islandsData[islandName];

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
                islandData = islandsData[islandName];

            if (islandData.currentPosition <= middlePos) newLeft = newIslandSpacing + islandData.currentPosition * (newIslandSpacing + smallIslandWidth);
            else newLeft = newIslandSpacing * 2 + fullIslandWidth + (islandData.currentPosition - 1) * (newIslandSpacing + smallIslandWidth);

            animateObj = {
                left: newLeft,
                top: 0
            };

            if (islandData === currentIsland) {
                animateObj.width = fullIslandWidth;
                islandData.state = 1;
            }
            else {
                animateObj.width = smallIslandWidth;

                if (islandData.state === 2) {
                    $(islandData.domElem).find('.island-categories').removeClass('active');
                }

                islandData.state = 0;
            }

            $(islandData.domElem).animate(animateObj, function() {
                disableIslandMove = false;
                if (islandData === currentIsland) {
                    $(islandData.domElem).removeClass('island-small').addClass('island-full').children('.island-categories').addClass('active').css({
                        left: -$(islandData.domElem).position().left
                    });
                }
                else {
                    $(islandData.domElem).removeClass('island-full').addClass('island-small').children('.island-categories').removeClass('active');
                }
            });
        });
    }

    function islandClickHandler(e) {
        var islandDomElem = e.currentTarget,
            currentIsland = getIslandDataByDom(islandDomElem);

        if (currentIsland.state === 0) {
            if (!disableIslandMove) {
                islandSelect(currentIsland);
            }
        }
        else if (currentIsland.state === 1) {
            //openIsland(currentIsland);
        }
    }

    function initOceanClick() {
        $(document).bind('click', function(e) {
            var islands,
                target = e.target,
                node = target,
                isIslandClick = false;

            while (node.nodeName.toUpperCase() !== 'BODY') {
                if ($(node).hasClass('island')) isIslandClick = true;

                node = node.parentNode;
            }

            if (!isIslandClick && !disableIslandMove) {

                disableIslandMove = true;

                islandsNames.forEach(function(islandName) {
                    var islandData = islandsData[islandName],
                        animateObj = {
                            left: (middleIslandWidth * islandSpacingRatio) + (islandData.position * middleIslandWidth * (1 + islandSpacingRatio)),
                            width: middleIslandWidth,
                            top: middleIslandTop
                        };

                    $(islandData.domElem).animate(animateObj, function() {
                        $(islandData.domElem).removeClass('island-full').addClass('island-small').children('.island-categories').removeClass('active');
                    });

                    islandData.state = 0;
                    islandData.currentPosition = islandData.position;
                });

                setTimeout(function() {
                    disableIslandMove = false;
                }, 400);
            }
        });
    }

    function initDepartmentsAlign() {
        islandsNames.forEach(function(iName) {
            var iData = islandsData[iName],
                dKeys = iData.children ? Object.keys(iData.children) : [],
                iDomElem = iData.domElem,
                $departmentsList = $(iDomElem).children('.island-categories'),
                childrenLength = dKeys.length,
                columns = Math.ceil(Math.sqrt(childrenLength)),
                dCalcWidth = columns * 83 + 10,
                rows = columns - (Math.pow(columns, 2) - columns === childrenLength ? 1 : 0);

            $departmentsList.css({
                width: dCalcWidth,
                left: (fullIslandWidth - dCalcWidth) / 2,
                top: (fullIslandWidth * 0.6 - rows * 83 + 10) / 2
            });

            dKeys.forEach(function(dName, ind) {
                var dData = iData.children[dName],
                    $dDomElem = $departmentsList.children('li').eq(ind),
                    childrens = dData.children ? Object.keys(dData.children) : [],
                    childrenLength = childrens.length,
                    columns = Math.ceil(Math.sqrt(childrenLength)),
                    cCalcWidth = columns * 65 + 7,
                    rows = columns - (Math.pow(columns, 2) - columns === childrenLength ? 1 : 0);
                    $catsList = $dDomElem.children('.island-categories');

                $catsList.css({
                    width: cCalcWidth
                    //top: (fullIslandWidth - cCalcWidth) / 2,
                    //left: (fullIslandWidth * 0.6 - rows * 65 + 7) / 2
                });
            });
        });
    }

    function initCategoriesAlign() {
        islandsNames.forEach(function(iName) {
            var iData = islandsData[iName],
                dKeys = iData.children ? Object.keys(iData.children) : [],
                iDomElem = iData.domElem,
                $departmentsList = $(iDomElem).children('.island-categories');

            dKeys.forEach(function(dName, ind) {
                var dData = iData.children[dName],
                    $dDomElem = $departmentsList.children('li').eq(ind),
                    childrens = dData.children ? Object.keys(dData.children) : [],
                    childrenLength = childrens.length,
                    cCalcWidth = Math.min(900, childrenLength * 65) + 5,
                    $catsList = $dDomElem.children('.island-categories');

                $catsList.css({
                    width: cCalcWidth,
                    left: -(cCalcWidth - 75) / 2 // FIXME
                });
            });
        });
    }

    /*function openIsland(islandData) {
        islandData.state = 2;

        $(islandData.domElem).removeClass('island-small').addClass('island-full').children('.island-categories').addClass('active');
    }*/

    /*function initIslandCategories() {
        $('.island-categories li').bind('click', function(e) {
            var position,
                listLeft = 0,
                listTop = 0,
                $item = $(e.currentTarget),
                $node = $item,
                $parentLists = $item.parents('.island-categories'),
                isFirstLevel = $parentLists.eq(0).hasClass('active'),
                isSecondLevel = $parentLists.eq(1) && $parentLists.eq(1).hasClass('active'),
                hasChildren = $item.hasClass('has-childrens');

            if ((isFirstLevel || isSecondLevel) && hasChildren) {
                $parentLists.removeClass('active');

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
    }*/

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
        // init: init,
        //  preprocessData: preprocessData
    }

})();