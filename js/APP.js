var APP = new Mediator();

$(function() {

    initAPP();

});

function initAPP() {
    $.ajax('http://193.161.193.147/ajax/get_init_data_jsonp', {
        dataType: 'jsonp',
        jsonpCallback: 'pageInit',
        success: function(data, textStatus, jqXHR) {
            if (data && data.result === 'success') {
                if (data.categories) {
                    APP.Publish("Islands:init", data.categories);
                }
                else {
                    // publish islands data error: APP.Publish('Islands.error.nodata');
                }
            }
            else {
                // global error
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // global error
        }
    });

    FILTERS.init();

    setTimeout(function() { // FIXME
        FILTERS.create({
            type: 'range',
            title: 'Price',
            enabled: 1, // TODO: учитывать enabled, applied и found
            applied: 1,
            found: 0,
            value: {
                from: 1200,
                to: 3200
            }
        });

        FILTERS.create({
            type: 'list',
            title: 'List',
            enabled: 1,
            applied: 1,
            found: 0,
            value: [
                {
                    opt: 'opt1',
                    found: 10,
                    checked: false // TODO: учитывать checked
                },
                {
                    opt: 'opt2',
                    found: 15,
                    checked: true
                },
                {
                    opt: 'opt3',
                    found: 20,
                    checked: false
                },
                {
                    opt: 'opt4',
                    found: 25,
                    checked: true
                },
                {
                    opt: 'opt5',
                    found: 30,
                    checked: false
                },
                {
                    opt: 'opt6',
                    found: 35,
                    checked: false
                },
                {
                    opt: 'opt7',
                    found: 40,
                    checked: false
                }
            ]
        });

        FILTERS.create({
            type: 'trigger',
            title: 'Best Deal',
            enabled: 1,
            applied: 1,
            found: 1,
            value: 1
        });

    }, 0);

    //APP.Publish("Islands:init", ISLANDS_Data);
}


// что за keywords фильтр?

