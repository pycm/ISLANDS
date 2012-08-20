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
    // initPriceFilter($('.filter-type-price'), 1200, 3200);
});


/*var FILTERS = (function() {
    var filterTypes = {};

    function create(data) {
        var filterObj,
            typeProto = filterTypes[data.type];

        if (typeProto) {
            filterObj = Object.create(typeProto);
        }
        else {
            return false;
        }
    }

    function decl(type, typeObj) {
        filterTypes[type] = typeObj;
    }

    return {
        create: create,
        decl: decl
    }

})();

(function() {
    var tmplNode = $('#filter-price'),
        tmpl = Handlebars.compile($tmplNode.html());

    FILTERS.decl('price', {

        template: function(data) {

        },

        init: function() {

        }

    });

})();*/