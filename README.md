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

### Draw toolbar ###

* The [Draw] toolbar allows the user to draw geometries on the map.
* Events attached to the [Draw] toolbar control what happens when the user finishes drawing a geoemtry.

#### Events ####

##### draw-complete #####

* A [QueryTask] is executed to determine which counties the user-drawn geometry will intersect.

### QueryTask ###

#### Events ####

##### complete #####
	


[Draw]:https://developers.arcgis.com/en/javascript/jsapi/draw-amd.html
[QueryTask]:https://developers.arcgis.com/en/javascript/jsapi/querytask-amd.html