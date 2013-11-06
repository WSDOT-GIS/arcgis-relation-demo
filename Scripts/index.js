/*global require*/
/*jslint white:true,browser:true*/
if (!(Array.prototype.map && window.Element.prototype.addEventListener)) { // Check for required functions...
	(function () {
		"use strict";
		var element;
		document.getElementById("map").removeNode(true);
		document.getElementById("toolbar").removeNode(true);
		element = document.createElement("p");
		element.innerHTML = "Your browser is not supported. Try the latest version of one of the following: Firefox, Chrome, Internet Explorer.";
		document.body.appendChild(element);
	}());
} else {
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
		var map, geometryService, draw, queryTask, serviceAreaLayer, selectionLayer, userGraphicLayer;

		esriConfig.defaults.io.proxyUrl = "proxy.ashx";

		/** Sends the error to the console if the browser supports it.
		*/
		function handleError(error) {
			if (window.console) {
				if (window.console.error) {
					window.console.error("error", error);
				}
			}
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
		 * @param {esri/tasks/FeatureSet} featureSet
		 * @param {esri/Graphic[]} featureSet.features
		 */
		function addSelectedCountiesToLayer(featureSet) {
			var relationParameters, responseGeometries;

			/** @typedef Relationship
			 * @property {number} geometry1Index - Index corresponding to the "responseGeometries" array.
			 * @property {number} geometry2Index - Index corresponding to the servideAreaLayer.graphics array. In this app there is only ever one service area graphic, so this will always be 0.
			 */

			/** Adds the county geometries that are inside of the service area to the selection graphics layer.
			 * @param {Relationship[]} relationships
			 */
			function handleRelation(relationships) {
				var i, l, relationship, previouslyEncounteredIndexes = [];

				for (i = 0, l = relationships.length; i < l; i += 1) {
					relationship = relationships[i];
					if (!arrayContainsValue(previouslyEncounteredIndexes, relationship.geometry1Index)) {
						selectionLayer.add(featureSet.features[relationship.geometry1Index]);
						previouslyEncounteredIndexes.push(relationship.geometry1Index);
					}
				}
			}

			// Loop through the array of Graphics and return an array of their Geometries.
			responseGeometries = featureSet.features.map(getGeometryFromFeature);

			if (!serviceAreaLayer.graphics.length) {
				geometryService.union(responseGeometries, handleUnion, handleError);
			} else {
				selectionLayer.clear();

				relationParameters = new RelationParameters();
				relationParameters.geometries1 = responseGeometries;
				relationParameters.geometries2 = serviceAreaLayer.graphics.map(getGeometryFromFeature);
				relationParameters.relation = RelationParameters.SPATIAL_REL_INTERIORINTERSECTION;


				geometryService.relation(relationParameters, handleRelation, handleError);
			}
		}

		/** Queries the counties layer for features that intersect the drawn geometry.
		 * @param {object} response
		 * @param {Geometry} response.geometry
		 */
		function queryForIntersectingCounties(response) {
			var query;

			/** Query the counties layer for intersecting geometry.
			 * @param {(Geometry|Geometry[])} geometry
			 */
			function queryCounties(geometry) {
				query = new Query();
				query.returnGeometry = true;
				query.geometry = geometry instanceof Array ? geometry[0] : geometry;
				queryTask.execute(query).then(addSelectedCountiesToLayer, handleError);
			}

			if (serviceAreaLayer.graphics.length) {
				// Trim the drawn geometry to only the portion that is inside the service area.
				geometryService.intersect([response.geometry], serviceAreaLayer.graphics[0].geometry, queryCounties, handleError);
				userGraphicLayer.add(new Graphic(response.geometry));
			} else {
				queryCounties(response.geometry);
			}
		}

		/** Creates graphics layers for service area and selections, then adds them to the map.
		 * Creates the Draw toolbar object, activates it and attaches a draw-complete event.
		 */
		function handleOnMapLoad() {
			// Create the graphics layers and then add them to the map.
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

			userGraphicLayer = new GraphicsLayer({
				id: "userGraphics",
				className: "user-graphics",
				styling: false
			});

			map.addLayer(serviceAreaLayer);
			map.addLayer(selectionLayer);
			map.addLayer(userGraphicLayer);

			// Create the draw toolbar.
			draw = new Draw(map);
			draw.activate("polyline");
			draw.on("draw-complete", queryForIntersectingCounties);

			// Setup the clear button to clear the graphics layer.
			document.getElementById("clearButton").addEventListener("click", function () {
				if (userGraphicLayer.graphics.length) {
					userGraphicLayer.clear();
				} else if (selectionLayer.graphics.length) {
					selectionLayer.clear();
				} else {
					serviceAreaLayer.clear();
				}
			});
		}

		// Create geometryService, queryTask, and map objects.
		geometryService = new GeometryService("http://www.wsdot.wa.gov/geosvcs/ArcGIS/rest/services/Geometry/GeometryServer");

		queryTask = new QueryTask("http://www.wsdot.wa.gov/geosvcs/ArcGIS/rest/services/Shared/CountyBoundaries/MapServer/0");

		map = new Map("map", {
			basemap: "gray",
			center: [-120.80566406246835, 47.41322033015946],
			zoom: 7,
			showAttribution: true
		});

		// Attach the map load event handler.
		map.on("load", handleOnMapLoad);
	});
} 