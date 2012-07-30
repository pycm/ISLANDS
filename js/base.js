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
    var priceSlider = $('.filter-applied-type-price .filter-applied-form .slider'),
        priceSliderFrom = $('.filter-applied-type-price .filter-applied-form .slider .from-filter'),
        priceSliderTo = $('.filter-applied-type-price .filter-applied-form .slider .to-filter'),
        priceSliderBg = $('.filter-applied-type-price .filter-applied-form .slider .bg'),
        priceFromInput = $('.filter-applied-type-price .filter-applied-form .from-price'),
        priceToInput = $('.filter-applied-type-price .filter-applied-form .to-price'),
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