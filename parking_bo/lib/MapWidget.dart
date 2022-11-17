import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart'; // Suitable for most situations
import 'package:flutter_map/plugin_api.dart'; // Only import if required functionality is not exposed by default
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter_map_location_marker/flutter_map_location_marker.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:geojson/geojson.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:parking_bo/PositionRecognition.dart';

final LocationSettings locationSettings = LocationSettings(
  accuracy: LocationAccuracy.high,
  distanceFilter: 100,
);

class MapWidget extends StatefulWidget {
  var mapCenter = new LatLng(44.493754, 11.343095);
  var vertex1 = new LatLng(44.500000, 11.343095);
  var vertex3 = new LatLng(44.483754, 11.363295);

  @override
  _MapWidgetState createState() => _MapWidgetState();
}

class _MapWidgetState extends State<MapWidget> {
  /// Data for the Flutter map polylines layer
  final polygons = <Polygon>[];
  LatLng location = LatLng(44.493754, 11.343095);
  late CenterOnLocationUpdate _centerOnLocationUpdate;

  Future<void> parseAndDrawAssetsOnMap() async {
    final geo = GeoJson();
    geo.processedPolygons.listen((GeoJsonPolygon polygon) {
      /// when a line is parsed add it to the map right away
      List<LatLng> myPoints = <LatLng>[];
      polygon.geoSeries.forEach((element) {
        myPoints = element.toLatLng();
      });
      setState(() => polygons.add(Polygon(
          points: myPoints,
          color: Colors.lightBlue.shade50.withOpacity(0.6),
          isFilled: true)));
    });
    geo.endSignal.listen((_) => geo.dispose());
    final data = await rootBundle.loadString('assets/zone.geojson');
    final features = await geo.parse(data, verbose: true);
  }

  void _getPermissionLocation() async {
    LocationPermission permission;

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        print("Permission denied");
        /**In caso tornare indietro */
        return;
      }
    }
    ;
  }

  @override
  void initState() {
    parseAndDrawAssetsOnMap();
    _getPermissionLocation();
    _centerOnLocationUpdate = CenterOnLocationUpdate.always;
    Geolocator.getPositionStream(locationSettings: locationSettings)
        .listen((Position position) {
      setState(() {
        location = LatLng(position.latitude, position.longitude);
      });
    });
  }

  @override
  dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FlutterMap(
      options: MapOptions(
        center: location,
        zoom: 18,
        onPositionChanged: (MapPosition position, bool hasGesture) {
          if (hasGesture) {
            setState(
              () => _centerOnLocationUpdate = CenterOnLocationUpdate.never,
            );
          }
        },
      ),
      children: [
        TileLayer(
          urlTemplate: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          userAgentPackageName: 'dev.fleaflet.flutter_map.example',
        ),
        PolygonLayer(polygonCulling: false, polygons: polygons),
        CurrentLocationLayer(
          centerOnLocationUpdate: _centerOnLocationUpdate,
          ),
        MarkerLayer(markers: [
          Marker(point: location, builder: (ctx) => Icon(
            Icons.my_location,                          //TODO:cambiare l'icona quando passa da moving a driving e viceversa on Icons.Navigation
          color: Colors.blueAccent,)),
        ])
      ],
    );
  }
}
