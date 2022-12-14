import 'package:ParkingBO/utils/httpRequest.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart'; // Suitable for most situations
import 'package:flutter_map/plugin_api.dart'; // Only import if required functionality is not exposed by default
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart';
import 'package:latlong2/latlong.dart';
import './utils/utils.dart';
import 'package:flutter_map_location_marker/flutter_map_location_marker.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:geojson/geojson.dart';
import 'dart:developer' as dev;
import 'package:flutter/services.dart' show rootBundle;
import 'ActivityRecognitionClass.dart';
import 'package:flutter_activity_recognition/flutter_activity_recognition.dart'
    as ar;
import 'package:fluttertoast/fluttertoast.dart';
import 'dart:async';

final LocationSettings locationSettings = LocationSettings(
  accuracy: LocationAccuracy.high,
  distanceFilter: 1,
);

class MapWidget extends StatefulWidget {
  //Initialize Activity Recognition class

  @override
  _MapWidgetState createState() => _MapWidgetState();
}

class _MapWidgetState extends State<MapWidget> {
  /// Data for the Flutter map polylines layer
  final polygons = <Polygon>[];
  var id_user = null;
  ar.ActivityType currentActivity = ar.ActivityType.UNKNOWN; 
  LatLng currentLocation = LatLng(44.493754, 11.343095); //Coordinates of Bologna
  late CenterOnLocationUpdate _centerOnLocationUpdate;
  late ActivityRecognition activityRecognition; 
  
  void updateCurrentActivity(ar.ActivityType activityType) {

    if (currentActivity == ar.ActivityType.IN_VEHICLE &&
        activityType == ar.ActivityType.WALKING) {
      Fluttertoast.showToast(
          msg: "Change from driving to walking",
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.BOTTOM,
          timeInSecForIosWeb: 1,
          backgroundColor: Colors.red,
          textColor: Colors.white,
          fontSize: 16.0);
      //call_function(ParkingType.EXITING, currentLocation);
      } else if (currentActivity == ar.ActivityType.WALKING &&
        activityType == ar.ActivityType.IN_VEHICLE) {
      Fluttertoast.showToast(
          msg: "Change from walking to driving",
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.BOTTOM,
          timeInSecForIosWeb: 1,
          backgroundColor: Colors.red,
          textColor: Colors.white,
          fontSize: 16.0);
      //call_function(ParkingType.ENTERING, currentLocation);
    }
    Fluttertoast.showToast(
        msg: "New Activity Detected: " + activityType.toString(),
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.CENTER,
        timeInSecForIosWeb: 3,
        backgroundColor: Colors.red,
        textColor: Colors.white,
        fontSize: 16.0);
    setState(() {
      currentActivity = activityType;
    });
  }

  Future<void> drawPolygonsOnMap() async {
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
 
  Future<bool> _getPermissionLocation() async {
      LocationPermission permission;
      permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          print("Permission denied");
          /**In caso tornare indietro */
          return false;
        }
      }
      return true;
  }

   createLocationListener(){
    Geolocator.getPositionStream(locationSettings: locationSettings)
            .listen((Position position) {
      setState(() {
        currentLocation = LatLng(position.latitude, position.longitude);
      });   
    });
   
  }

  @override
  void initState() {
    _centerOnLocationUpdate = CenterOnLocationUpdate.always;
    _getPermissionLocation();
    activityRecognition = new ActivityRecognition(updateCurrentActivity);
    drawPolygonsOnMap();
    createLocationListener();
    //testing functions
    //call_function(ParkingType.UNKNOWN, currentLocation);
    //get_parkings(currentLocation);
  }

  @override
  dispose() {
    super.dispose();
    activityRecognition.dispose();
  }


  IconData getMarkerType(){
    //TODO: switch instead of if
    if(currentActivity == ar.ActivityType.IN_VEHICLE)
      return Icons.navigation; // CASE: DRIVING
    else if (currentActivity == ar.ActivityType.WALKING)
      return Icons.circle; // CASE: Walking
    else
      return Icons.my_location; //CASE: Still, Unknown
    }

@override
  Widget build(BuildContext context) {
    return FlutterMap(
      options: MapOptions(
        center: currentLocation,
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
          Marker(
              point: currentLocation,
              builder: (ctx) => Icon(
                    getMarkerType(),
                    color: Colors.red,
                  )),
        ])
      ], //Children
    );
  }
}