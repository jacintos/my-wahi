(function($) {

    var apiKey = "ABQIAAAAnnh3vADukoSiGDyFNhOAihT2yXp_ZAY8_ufC3CFXhHIE1NvwkxRFihSNGE3faXJghnYraM8YXUr8aQ";

    $.fn.searchForLoc = function(fn) {
        return this.each(function() {
            var $this = $(this);
            var search = $this.val();
            var opts = {
                q : search,
                output : "json",
                key : apiKey
            };

            $.getJSON("http://maps.google.com/maps/geo?callback=?", opts, function(resp) {
                var data = [];

                if (fn) {
                    resp.Placemark.forEach(function(placemark) {
                        data.push({
                            address : placemark.address,
                            coords : placemark.Point.coordinates
                        });
                    });

                    fn(data);
                }
            });
        });
    };

})(jQuery);
