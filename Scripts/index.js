﻿/*global require*/
require([
	"esri/map",
	"esri/layers/GraphicsLayer",
	"esri/tasks/GeometryService",
	"esri/toolbars/draw",
	"esri/tasks/QueryTask",
	"esri/tasks/query"
], function (Map, GraphicsLayer, GeometryService, Draw, QueryTask, Query) {
	"use strict";
	var map, geometryService, draw, queryTask, serviceAreaLayer, selectionLayer;



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

	function addSelectedCountiesToLayer(queryResponse) {
		if (!serviceAreaLayer.graphics.length) {
			queryResponse.features.forEach(function (feature) {
				serviceAreaLayer.add(feature);
			});
		} else {
			queryResponse.features.forEach(function (feature) {
				selectionLayer.add(feature);
			});
		}
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

	function handleOnMapLoad() {
		// Create the selected counties layer.
		serviceAreaLayer = new GraphicsLayer({
			id: "serviceArea",
			className: "service-area",
			styling: false
		});

		selectionLayer = new GraphicsLayer({
			id: "selection",
			className: "selection",
			styling: false
		});

		map.addLayer(serviceAreaLayer);
		map.addLayer(selectionLayer);

		// Create the draw toolbar.
		draw = new Draw(map);
		draw.activate("polyline");
		draw.on("draw-complete", selectCountiesOnDrawComplete);
	}

	geometryService = new GeometryService("http://www.wsdot.wa.gov/geosvcs/ArcGIS/rest/services/Geometry/GeometryServer");

	queryTask = new QueryTask("http://www.wsdot.wa.gov/geosvcs/ArcGIS/rest/services/Shared/CountyBoundaries/MapServer/0");

	map = new Map("map", {
		basemap: "gray",
		center: [-120.80566406246835, 47.41322033015946],
		zoom: 7,
		showAttribution: true
	});

	map.on("load", handleOnMapLoad);
});