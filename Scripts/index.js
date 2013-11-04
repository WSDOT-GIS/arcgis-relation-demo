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
	var map, geometryService, draw, queryTask, selectedCountiesLayer;

	geometryService = new GeometryService("http://www.wsdot.wa.gov/geosvcs/ArcGIS/rest/services/Geometry/GeometryServer");

	queryTask = new QueryTask("http://www.wsdot.wa.gov/geosvcs/ArcGIS/rest/services/Shared/CountyBoundaries/MapServer/0");

	


	map = new Map("map", {
		basemap: "gray",
		center: [-120.80566406246835, 47.41322033015946],
		zoom: 7,
		showAttribution: true
	});

	map.on("load", function () {

		/** 
		 * @returns {dojo/Deferred}
		 */
		function queryCounties(response) {
			var query;

			query = new Query();
			query.returnGeometry = true;
			query.geometry = response.geometry;
			return queryTask.execute(query);
		}

		// Create the selected counties layer.
		selectedCountiesLayer = new GraphicsLayer({
			id: "selectedCounties",
			className: "county",
			styling: false
		});

		map.addLayer(selectedCountiesLayer);

		function addSelectedCountiesToLayer(queryResponse) {
			queryResponse.features.forEach(function (feature) {
				selectedCountiesLayer.add(feature);
			});
		}

		function handleError(error) {
			console.error("error", error);
		}

		/**
		 * @param {object} response
		 * @param {object} response.geometry
		 */
		function selectCountiesOnDrawComplete(response) {
			queryCounties(response).then(addSelectedCountiesToLayer, handleError);
		}

		// Create the draw toolbar.
		draw = new Draw(map);
		draw.activate("polyline");
		on.once(draw, "draw-complete", selectCountiesOnDrawComplete);

	});
});