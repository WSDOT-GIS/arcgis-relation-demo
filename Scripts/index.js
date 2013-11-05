/*global require*/
/*jslint white:true,browser:true*/
require([
	"esri/config",
	"esri/map",
	"esri/graphic",
	"esri/layers/GraphicsLayer",
	"esri/tasks/GeometryService",
	"esri/tasks/RelationParameters",
	"esri/toolbars/draw",
	"esri/tasks/QueryTask",
	"esri/tasks/query"
], function (esriConfig, Map, Graphic, GraphicsLayer, GeometryService, RelationParameters, Draw, QueryTask, Query) {
	"use strict";
	var map, geometryService, draw, queryTask, serviceAreaLayer, selectionLayer;

	esriConfig.defaults.io.proxyUrl = "proxy.ashx";

	function handleError(error) {
		if (window.console) {
			if (window.console.error) {
				window.console.error("error", error);
			}
		}
	}

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

	/** Creates a Graphic from the union Geometry and adds it to the service area graphics layer.
	 * @param {Geometry} geometry
	 */
	function handleUnion(geometry) {
		var graphic;
		graphic = new Graphic(geometry);
		serviceAreaLayer.add(graphic);
	}



	/** Returns the geometry property of a Graphic. Intended for use with Array.map function.
	 * @returns {Geometry}
	 */
	function getGeometryFromFeature(/**{Graphic}*/ feature) {
		return feature.geometry;
	}

	/** Determines if any of the values in an array match a given value.
	 * @returns {boolean}
	 */
	function arrayContainsValue(/**{Array}*/ a, v) {
		var output = false, i, l;

		for (i = 0, l = a.length; i < l; i += 1) {
			if (a[i] === v) {
				output = true;
				break;
			}
		}

		return output;
	}

	/**
	 * @param {object} queryResponse
	 * @param {Geometry} queryResponse.geometry
	 * @param {Geometry} queryResponse.geographicGeometry
	 */
	function addSelectedCountiesToLayer(queryResponse) {
		var relationParameters, responseGeometries;

		/** @typedef Relationship
		 * @property {number} geometry1Index
		 * @property {number} geometry2Index
		 */

		function handleRelation(/**{Relationship[]}*/ relationships) {
			var i, l, relationship, previouslyEncounteredIndexes = [];

			for (i = 0, l = relationships.length; i < l; i += 1) {
				relationship = relationships[i];
				if (!arrayContainsValue(previouslyEncounteredIndexes, relationship.geometry1Index)) {
					selectionLayer.add(queryResponse.features[relationship.geometry1Index]);
					previouslyEncounteredIndexes.push(relationship.geometry1Index);
				}
			}
		}

		responseGeometries = queryResponse.features.map(getGeometryFromFeature);

		if (!serviceAreaLayer.graphics.length) {
			geometryService.union(responseGeometries, handleUnion, handleError);
		} else {
			relationParameters = new RelationParameters();
			relationParameters.geometries1 = responseGeometries;
			relationParameters.geometries2 = serviceAreaLayer.graphics.map(getGeometryFromFeature); 
			relationParameters.relation = RelationParameters.SPATIAL_REL_WITHIN;

			selectionLayer.clear();

			geometryService.relation(relationParameters, handleRelation, handleError);
		}
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