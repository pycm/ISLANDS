function Suggest(spec){
    var boundTo = $(spec.boundTo),
        suggestionBox = $(spec.suggestionBox),
        delay = spec.delay || 300,
        dataSource = null,
        afterData = null,
        intervalId = null;

    function init() {
        suggestionBox.hide();
    }

    function bindDataSource(callback) {
        dataSource = callback;
    }

    function close() {
        suggestionBox.empty();
        suggestionBox.hide();
    }

    function show() {
        suggestionBox.show();
    }

    function bindEvents() {
        boundTo.keypress(function(e) {
            clearInterval(intervalId);

            intervalId = setTimeout(function() {
                var value = e.srcElement.value || '';

                dataSource(value, suggestionBox);

                if (suggestionBox.children().length < 1) {
                    close();
                }
                else{
                    show();
                }
            }, delay);
        });
    }

    init();
    bindEvents();

    return {
        bindDataSource: bindDataSource,
        close: close,
        show: show
    }
}