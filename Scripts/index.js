/*global require*/
require([
	"esri/map",
	"esri/tasks/GeometryService",
	"esri/toolbars/draw"
], function (Map, GeometryService, Draw) {
	"use strict";
	var map, geometryService, draw;

	geometryService = new GeometryService("http://www.wsdot.wa.gov/geosvcs/ArcGIS/rest/services/Geometry/GeometryServer");


	map = new Map("map", {
		basemap: "gray",
		center: [-120.80566406246835, 47.41322033015946],
		zoom: 7,
		showAttribution: true
	});

	map.on("load", function () {
		// Create the draw toolbar.
		draw = new Draw(map);
	});
});