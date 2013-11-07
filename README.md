arcgis-relation-demo
====================

Demonstrates use of the GeometryService Relation operation.

## Setup ##

1. Clone the repository using `git clone` command.
2. Open the project in Visual Studio 2013.
3. Press Ctrl + F5 to start the application.

## User interaction ##

1. Draw a polyline on the map.
2. Wait for results. A service area will be drawn on the map outlining the counties that the line intersected.
3. Draw another polyline on the map.
4. Wait for the results. The selected counties will be drawn on the map. None of the selected counties should be outside of the service area polygon, even if the line the user drew WAS outside the service area.

## Behind the scenes ##

* Whenever the user draws a geometry, a [QueryTask] is executed to see which county polygons the lines intersect.
	* If a *service area* geometry has not yet been defined...
		* The [GeometryService]'s [union] function is called. This will combine the county geometries into a single *service area* geoemtry.
		* When the [union] has returned a response, the resulting unioned geometry is added to the service area [GraphicsLayer].
	* If a *service area* has already been defined...
		* The [GeometryService]'s [relation] operation is called in order to determine which of the county geometries returned by the [QueryTask] are inside of the *service area*.
		* When the [relation] operation returns a result, the returned relationship object array is examined to determine which county features are inside of the *service area*.
		* The county graphics that are inside of the *service area* are added to the *selection* [GraphicsLayer].
		* The original graphic that the user drew is added to the user-drawn graphics [GraphicsLayer].


[Draw]:https://developers.arcgis.com/en/javascript/jsapi/draw-amd.html
[GeometryService]:https://developers.arcgis.com/en/javascript/jsapi/geometryservice-amd.html
[GraphicsLayer]:https://developers.arcgis.com/en/javascript/jsapi/graphicslayer-amd.html
[QueryTask]:https://developers.arcgis.com/en/javascript/jsapi/querytask-amd.html
[relation]:https://developers.arcgis.com/en/javascript/jsapi/geometryservice-amd.html#relation
[union]:https://developers.arcgis.com/en/javascript/jsapi/geometryservice-amd.html#union