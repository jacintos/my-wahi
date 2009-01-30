(function($) {

    var apiKey = "ABQIAAAAtO1hv_X8SmlsRtfq49PGKxT3sD9sIctxrza221FRMo2Z44skZRQ4f1MSp3hry72oNc6rOHDBZidScA";
    var mapOptions;
    var map;
    var pointer, pointerLayer;
    var popup;
    var selLocCallback;

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

                if (resp.Status.code != 200) {
                    console.log("Geocoding failed with error " + resp.Status.code);
                } else {
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

    $.fn.mapify = function(lon, lat, fn) {
        mapOptions = {
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
        } else {
            console.log("Incompatible with Google maps");
        }
        $.pointToLoc(new OpenLayers.Geometry.Point(coords.lon, coords.lat));
        selLocCallback = fn;
        registerClickHandler();
        return this;
    };

    $.pointToLoc = function(point) {
        if (!pointer) {
            pointerLayer = new OpenLayers.Layer.Vector("pointer", {
                styleMap : new OpenLayers.StyleMap({
                    externalGraphic : "/img/arrow.png",
                    graphicYOffset : -60,
                    pointRadius : 45
                })
            });
            pointer = new OpenLayers.Feature.Vector(point);
            pointerLayer.addFeatures([pointer]);
            map.addLayer(pointerLayer);
        } else {
            pointerLayer.eraseFeatures([pointer]);
            pointer.geometry = point;
            pointerLayer.drawFeature(pointer);
        }
    };

    $.reverseGeocode = function(lon, lat, fn) {
        var opts = {
            key : apiKey,
            ll : lat + "," + lon,
            output : "json"
        };
        $.getJSON("http://maps.google.com/maps/geo?callback=?", opts, function(resp) {
            if (resp.Status.code != 200) {
                console.log("Reverse geocoding failed with error " + resp.Status.code);
            } else {
                fn(resp.Placemark);
            }
        });
    };

    $.promptDialog = function(content) {
        var pixel = new OpenLayers.Pixel(940, 50);
        var coords = map.getLonLatFromViewPortPx(pixel);

        if (!popup) {
            var size = new OpenLayers.Size(270, 100);

            popup = new OpenLayers.Popup.Anchored("prompt", coords, size, content, null, true, function() {this.hide()});
            popup.setOpacity(0.85);
            map.addPopup(popup);
        } else {
            popup.hide();
            popup.lonlat = coords;
            popup.contentHTML = content;
            popup.show();
        }
    };

    $.hideDialog = function() {
        popup.hide();
    };

    $.centerMapOnPointer = function() {
        var coords = new OpenLayers.LonLat(pointer.geometry.x, pointer.geometry.y);
        map.setCenter(coords, 10);
    };

    function registerClickHandler() {
        var handler = new OpenLayers.Handler.Click({map : map}, {
            click : function(e) {
                var coords = map.getLonLatFromViewPortPx(e.xy);
                var point = new OpenLayers.Geometry.Point(coords.lon, coords.lat)
                $.pointToLoc(point);
                if (selLocCallback) {
                    coords.transform(mapOptions.displayProjection, mapOptions.projection);
                    selLocCallback(coords.lon, coords.lat);
                }
            },
            dblclick : function() {
                console.log("Map was double clicked");
            }
        }, {
            single : true,
            "double" : true,
            stopSingle : true,
            stopDouble : true
        });
        handler.setMap(map);
        handler.activate();
    }

})(jQuery);
