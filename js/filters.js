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


function initPriceFilter($wrapper, min, max) {
    var $title = $wrapper.find('.title'),
        $form = $wrapper.children('.filter-form'),
        $slider = $form.children('.slider'),
        $leftPointer = $slider.children('.left-pointer'),
        $rightPointer = $slider.children('.right-pointer'),
        $selectedArea = $slider.children('.selected-area'),
        $leftInput = $form.find('.from-input'),
        $rightInput = $form.find('.to-input'),
        $clear = $form.children('.clear'),
        pixelsPerValue = $slider.width() / (max - min),
        filterOffset = $slider.offset(),
        availableCoords = {
            min: -3,
            max: $slider.width() - 3
        },
        storage = {
            state: null,
            activePointer: null,
            cursorShift: null
        };

    clear();

    $leftPointer.add($rightPointer).on('selectstart dragstart', false).on('mousedown touchstart', function(e) {
        var $pointer = $(e.currentTarget),
            pointerType = getPointerTypeByDOM($pointer),
            pointerOffset = $pointer.offset();

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

            setPointerByPixels(newLeft, pointerType);
        }

        return false;
    }).on('mouseup touchend', function(e) {
        if (storage.state === 1) {
            storage.state = 0;
            storage.activePointer = null;
            storage.cursorShift = null;
        }
    });

    function setPointerByPixels(newLeft, pointerType) {
        var leftPointerFullOffset,    // !!!
            $pointer = getPointerDOMByType(pointerType),
            $input = getPointerInputByType(pointerType),
            minLeft = pointerType === 'left' ? availableCoords.min : $leftPointer.position().left + $leftPointer.width() + 3,
            maxLeft = pointerType === 'right' ? availableCoords.max : $rightPointer.position().left - $leftPointer.width() - 3;

        if (newLeft < minLeft) newLeft = minLeft;
        else if (newLeft > maxLeft) newLeft = maxLeft;

        $pointer.css('left', newLeft);

        $input.val(pixelsToPoints(newLeft));

        leftPointerFullOffset = $leftPointer.position().left + $leftPointer.width();
        $selectedArea.css({
            left: leftPointerFullOffset,
            width: $rightPointer.position().left - leftPointerFullOffset
        });

        updateTitle();
    }

    $leftInput.add($rightInput).on('change', function(e) {
        var $input = $(e.target),
            val = $input.val(),
            pointerType = getPointerTypeByInput($input);

        if (!val || !$.isNumeric(val)) val = pointerType === 'left' ? min : max;

        setPointerByPixels(pointsToPixels(val), pointerType);
    });

    function clear() {
        setPointerByPixels(pointsToPixels(min), 'left');
        setPointerByPixels(pointsToPixels(max), 'right');

        return false;
    }

   $clear.click(clear);

   function updateTitle() {
       var titleStr = 'price',
           fromVal = $leftInput.val(),
           toVal =  $rightInput.val();

       if (fromVal && $.isNumeric(fromVal)) titleStr += ' from &#x20ac;' + fromVal;
       if (toVal && $.isNumeric(toVal)) titleStr += ' to &#x20ac;' + toVal;

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

$(function() {
    initPriceFilter($('.filter-type-price'), 1200, 3200);
});

$(function() {
    return;
    var $slider = $('.filter-type-price .filter-form .slider'),
        $leftPointer = $slider.children('.left-pointer'),
        $rightPointer = $slider.children('.right-pointer'),
        $selectedArea = $slider.children('.selected-area'),
        $leftInput = $('.filter-type-price .filter-form'),
        $rightInput = $('.filter-type-price .filter-form'),
        max = 2500,
        pixelsPerValue = 160 / max, // FIXME
        filterCursorShift,
        filterCoords;

    priceSliderFrom.on('mousedown touchstart', function(e) {
        startSlide(e.pageX, e.pageY, $(this));
        return false;
    });
    priceSliderFrom.on('selectstart dragstart', false);
    priceSliderTo.on('mousedown touchstart', function(e) {
        startSlide(e.pageX, e.pageY, $(this));
        return false;
    });
    priceSliderTo.on('selectstart dragstart', false);

    function setSlidingValue(newValue, filterElem) {
        var newLeft = newValue * pixelsPerValue ^ 0;

        filterElem.css('left', newLeft);

        priceSliderBg.css({
            left: priceSliderFrom.position().left + 5,
            width:priceSliderTo.position().left - priceSliderFrom.position().left - 5
        });

        if (filterElem.hasClass('from-filter')) {
            priceFromInput.val(newValue + 950);
        }
        else {
            priceToInput.val(newValue + 950);
        }

        updateTitle();
    }

    function startSlide(downPageX, downPageY, filterElem) {
        var thumbCoords = filterElem.offset();

        filterCursorShift = {
          x: downPageX - thumbCoords.left,
          y: downPageY - thumbCoords.top
        };

        filterCoords = priceSlider.offset();

        $(document).on({
          'mousemove.slider': function(e) {
              onDocumentMouseMove(e, filterElem)
          },
          'mouseup.slider touchend.slider': function(e) {
              endSlide(filterElem)
          }
        });

        filterElem.addClass('sliding');
    }

    function endSlide(filterElem) {
        $(document).off('.slider');
        filterElem.removeClass('sliding');
    }

    function onDocumentMouseMove(e, filterElem) {
        var newLeft = e.pageX - filterCursorShift.x - filterCoords.left;

        if (newLeft < -3) {
          newLeft = -3;
        }

        var rightEdge = 162; // FIXME
        if (newLeft > rightEdge) {
          newLeft = rightEdge;
        }

        if (filterElem.hasClass('from-filter')) {
            var toFilterLeft = priceSliderTo.position().left;

            if (newLeft > toFilterLeft - 10) {
                newLeft = toFilterLeft - 10;
            }
        }
        else {
            var fromFilterLeft = priceSliderFrom.position().left;

            if (newLeft < fromFilterLeft + 10) {
                newLeft = fromFilterLeft + 10;
            }
        }

        setSlidingValue(Math.round((newLeft + 3) / pixelsPerValue), filterElem);
    }

    priceFromInput.change(function(e) {
        var val = priceFromInput.val();

        if (!val || !$.isNumeric(val)) val = 0;
        else if (+val < 950) val = 0;
        else if (+val > 3450) val = 3450 - 950;
        else if (priceToInput.val() && val > priceToInput.val() - 100) val = priceToInput.val() - 100 - 950;
        else val = val - 950;

        setSlidingValue(val, priceSliderFrom);
    });

    priceToInput.change(function(e) {
        var val = priceToInput.val();

        if (!val || !$.isNumeric(val)) val = 3450 - 950;
        else if (+val < 950) val = 0;
        else if (+val > 3450) val = 3450 - 950;
        else if (priceFromInput.val() && val < priceFromInput.val() + 100) val = priceFromInput.val() + 100 - 950;
        else val = val - 950;

        setSlidingValue(val, priceSliderTo);
    });

    function clear() {
        setSlidingValue(- 3 * 1 / pixelsPerValue, priceSliderFrom);
        setSlidingValue(3450 - 950, priceSliderTo);
        priceFromInput.val('');
        priceToInput.val('');
        updateTitle();
    }

    clear();

    $('.filter-applied-type-price .filter-applied-form .clear').click(function(e) {
        clear();
        return false;
    });

    function updateTitle() {
        var titleStr = 'price',
            fromVal = priceFromInput.val(),
            toVal =  priceToInput.val();

        if (fromVal && $.isNumeric(fromVal)) titleStr += ' from &#x20ac;' + fromVal;
        if (toVal && $.isNumeric(toVal)) titleStr += ' to &#x20ac;' + toVal;

        $('.filter-applied-type-price .title').html(titleStr);
    }
});


var FILTERS = (function() {

})();