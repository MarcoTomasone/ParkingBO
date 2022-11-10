import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart'; // Suitable for most situations
import 'package:flutter_map/plugin_api.dart'; // Only import if required functionality is not exposed by default
import 'package:latlong2/latlong.dart';

class MapWidget extends StatelessWidget{
  var mapCenter = new LatLng(44.493754, 11.343095);

  @override
  Widget build(BuildContext context) {
   return FlutterMap(
      options: MapOptions(
          center: mapCenter,
          zoom: 13.5,
      ),
      children: [
                TileLayer(
                 urlTemplate: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                userAgentPackageName: 'dev.fleaflet.flutter_map.example',
               ),

              PolygonLayer(
                polygonCulling: false,
                polygons: [
                      Polygon(
                        points: [LatLng(30, 40), LatLng(20, 50), LatLng(25, 45),],
                        color: Colors.blue,
                      ),
                ],
              )
            ] 
        );
    
  }


}