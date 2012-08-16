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

    //APP.Publish("Islands:init", ISLANDS_Data);
}

