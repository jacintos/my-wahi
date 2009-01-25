(function($) {

    var apiKey = "ABQIAAAAnnh3vADukoSiGDyFNhOAihT2yXp_ZAY8_ufC3CFXhHIE1NvwkxRFihSNGE3faXJghnYraM8YXUr8aQ";

    var map;

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

    $.fn.mapify = function(lon, lat) {
        var mapOptions = {
            projection: new OpenLayers.Projection("EPSG:4326"),
            displayProjection: new OpenLayers.Projection("EPSG:900913"),
            units: "m",
            maxResolution: 156543.0339,
            maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34)
        };

        var coords = new OpenLayers.LonLat(lon, lat).transform(mapOptions.projection, mapOptions.displayProjection);

        if (GBrowserIsCompatible()) {
            var baseLayer = new OpenLayers.Layer.Google("google", {
                sphericalMercator: true
            });
            map = new OpenLayers.Map(this.attr("id"), mapOptions);
            map.addLayer(baseLayer);
            map.setCenter(coords, 10);
            //map.zoomToMaxExtent();
        } else {
            console.log("Incompatible with Google maps");
        }
        return this;
    };

})(jQuery);
