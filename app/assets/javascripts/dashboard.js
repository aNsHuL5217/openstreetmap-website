//= require maplibre.map
//= require maplibre.i18n
//= require maplibre.combinedcontrolgroup

$(function () {
  const defaultHomeZoom = 11;
  let map;

  if ($("#map").length) {
    map = new maplibregl.Map({
      container: "map",
      style: OSM.MapLibre.Styles.Mapnik,
      attributionControl: false,
      locale: OSM.MapLibre.Locale,
      rollEnabled: false,
      dragRotate: false,
      pitchWithRotate: false,
      bearingSnap: 180,
      maxPitch: 0,
      center: OSM.home ? [OSM.home.lon, OSM.home.lat] : [0, 0],
      zoom: OSM.home ? defaultHomeZoom : 0
    });

    const position = $("html").attr("dir") === "rtl" ? "top-left" : "top-right";
    const navigationControl = new maplibregl.NavigationControl({ showCompass: false });
    const geolocateControl = new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    });
    map.addControl(new OSM.MapLibre.CombinedControlGroup([navigationControl, geolocateControl]), position);
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();

    const markerObjects = [];

    $("[data-user]").each(function () {
      const user = $(this).data("user");
      if (user.lon && user.lat) {
        const lat = parseFloat(user.lat);
        const lon = parseFloat(user.lon);

        const marker = OSM.MapLibre.getMarker({
          icon: "dot",
          color: user.color
        })
          .setLngLat([lon, lat])
          .setPopup(OSM.MapLibre.getPopup(user.description))
          .addTo(map);

        markerObjects.push({ marker: marker, lat: lat, lon: lon });
      }
    });

    const updateZIndex = () => {
      markerObjects.forEach((item) => {
        const point = map.project([item.lon, item.lat]);
        const zIndex = Math.round(point.y);
        item.marker.getElement().style.zIndex = zIndex;
      });
    };

    if (markerObjects.length > 0) {
      map.on("move", updateZIndex);
      map.on("rotate", updateZIndex);
      map.on("pitch", updateZIndex);
      updateZIndex();
    }
  }
});

