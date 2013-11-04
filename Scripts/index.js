/*global require*/
require([
	"dojo/on",
	"esri/map",
	"esri/layers/GraphicsLayer",
	"esri/tasks/GeometryService",
	"esri/toolbars/draw",
	"esri/tasks/QueryTask",
	"esri/tasks/query"
], function (on, Map, GraphicsLayer, GeometryService, Draw, QueryTask, Query) {
	"use strict";
	var map, geometryService, draw, geometry1, geometry2, queryTask, selectedCountiesLayer;

	geometryService = new GeometryService("http://www.wsdot.wa.gov/geosvcs/ArcGIS/rest/services/Geometry/GeometryServer");

	queryTask = new QueryTask("http://www.wsdot.wa.gov/geosvcs/ArcGIS/rest/services/Shared/CountyBoundaries/MapServer/0");

	


	map = new Map("map", {
		basemap: "gray",
		center: [-120.80566406246835, 47.41322033015946],
		zoom: 7,
		showAttribution: true
	});

	map.on("load", function () {
		function queryCounties() {
			var query;

			query = new Query();
			query.returnGeometry = true;
			query.geometry = response.geometry;
			return queryTask.execute(query)
		}


		selectedCountiesLayer = new GraphicsLayer({
			id: "selectedCounties",
			className: "county",
			styling: false
		});

		map.addLayer(selectedCountiesLayer);


		// Create the draw toolbar.
		draw = new Draw(map);

		draw.activate("polyline");

		on.once(draw, "draw-complete", function (response) {
			queryCounties(response).then(function (queryResponse) {
				queryResponse.features.forEach(function (value) {
					selectedCountiesLayer.add(value);
				});
			}, function (error) {
				console.error("error", error);
			});

			////// Assign the drawn geometry to geometry1 if it does not already exist.
			////if (!geometry1) {
			////	geometry1 = response.geometry;



			////	draw.activate("polyline");

			////	// TODO: add graphic to the map.
			////} else {
			////	geometry2 = response.geometry;

			////	// TODO: add graphic to the map.
			////	draw.deactivate();
			////}

			////// If two geometries have been drawn, begin the relate operation.
			////if (geometry1 && geometry2) {

			////}
		});
	});
});