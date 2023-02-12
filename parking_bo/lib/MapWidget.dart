import 'package:ParkingBO/utils/httpRequest.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_map/flutter_map.dart'; // Suitable for most situations
import 'package:flutter_map/plugin_api.dart'; // Only import if required functionality is not exposed by default
import 'package:flutter_sensors/flutter_sensors.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart';
import 'package:latlong2/latlong.dart';
import 'package:sensors_plus/sensors_plus.dart';
import './utils/utils.dart';
import 'package:flutter_map_location_marker/flutter_map_location_marker.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:geojson/geojson.dart';
import 'dart:developer' as dev;
import 'package:flutter/services.dart' show rootBundle;
import 'ActivityRecognitionClass.dart';
import 'package:flutter_activity_recognition/flutter_activity_recognition.dart' as ar;
import 'package:fluttertoast/fluttertoast.dart';
import 'dart:async';
import 'dart:convert';
import 'SensorRecognition.dart';
import 'utils/SaveFile.dart';
import 'Model.dart';

final LocationSettings locationSettings =
    LocationSettings(accuracy: LocationAccuracy.high, distanceFilter: 15);

enum userActivity { DRIVING, WALKING, STILL }

class MapWidget extends StatefulWidget {
  //Initialize Activity Recognition class

  @override
  _MapWidgetState createState() => _MapWidgetState();
}

class _MapWidgetState extends State<MapWidget> {
  /// Data for the Flutter map polylines layer
  final polygons = <Polygon>[];
  final markers = <Marker>[];
  bool start_listen = false;
  userActivity? userActivitySel = userActivity.WALKING;
  int? freeParking = 0;
  var id_user = null;
  ar.ActivityType currentActivity = ar.ActivityType.UNKNOWN;
  ar.ActivityType markerActivity = ar.ActivityType.UNKNOWN;
  LatLng currentLocation = LatLng(44.493754, 11.343095); //Coordinates of Bologna
  late CenterOnLocationUpdate _centerOnLocationUpdate;
  late ActivityRecognition activityRecognition;
  late SensorRecognition sensorRecognition;
  Model model = Model();
  int currentActivityModel = 0;

  void updateCurrentActivity(ar.ActivityType activityType) {
    if (currentActivity == ar.ActivityType.IN_VEHICLE && activityType == ar.ActivityType.WALKING) {
      Fluttertoast.showToast(
          msg: "Change from driving to walking",
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.BOTTOM,
          timeInSecForIosWeb: 5,
          backgroundColor: Colors.red,
          textColor: Colors.white,
          fontSize: 16.0);
      //sendActivity(ParkingType.EXITING, currentLocation, this.context);  //TODO: Uncomment if server up
    } else if (currentActivity == ar.ActivityType.WALKING && activityType == ar.ActivityType.IN_VEHICLE) {
      Fluttertoast.showToast(
          msg: "Change from walking to driving",
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.BOTTOM,
          timeInSecForIosWeb: 5,
          backgroundColor: Colors.red,
          textColor: Colors.white,
          fontSize: 16.0);
      sendActivity(ParkingType.ENTERING, currentLocation, this.context);   //TODO: Uncomment if server up
    }
    Fluttertoast.showToast(
        msg: "New Activity Detected: " + activityType.toString(),
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.CENTER,
        timeInSecForIosWeb: 3,
        backgroundColor: Colors.red,
        textColor: Colors.white,
        fontSize: 16.0);

    markerActivity = activityType;
    setState(() {
      if((activityType == ar.ActivityType.WALKING || activityType == ar.ActivityType.IN_VEHICLE) && (currentActivity != activityType)) 
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
          color: Colors.lightBlue.shade50.withOpacity(0.4),
          isFilled: true,
          borderColor: Colors.lightBlue.shade400,
          borderStrokeWidth: 3)));
    });
    geo.endSignal.listen((_) => geo.dispose());
    final data = await rootBundle.loadString('assets/zone.geojson');
    final features = await geo.parse(data, verbose: true);
  }

  //Get markers from database and show them on map
  Future<void> drawMarkersOnMap() async {
    setState(() {
      markers.clear();
    });
    Map<String, dynamic> chargers = await getChargingStations();
    for (var element in chargers["chargers"]) {
      setState(() {
        markers.add(
          Marker(
              point: LatLng(element["y"], element["x"]),
              builder: (ctx) => Icon(
                    Icons.ev_station_outlined,
                    color: element["n_charging_points_available"] > 0
                        ? Colors.green
                        : Colors.red, 
                  )),
        );
      });
    }
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

  createLocationListener() {
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
    sensorRecognition = new SensorRecognition();
    drawPolygonsOnMap();
    createLocationListener();
    drawMarkersOnMap();
    model.loadModel();

    Timer.periodic(Duration(seconds: 10), (timer) {
      int activityDetectedModel =
          model.predict(sensorRecognition.getFeatures());
      sensorRecognition.getRow(userActivitySel.toString(), currentActivity.toString());
      dev.log(activityDetectedModel.toString());
        Fluttertoast.showToast(
            msg: ((activityDetectedModel == 0) ? "DRIVING" : "WALKING") +
                " detected OUR MODEL",
            toastLength: Toast.LENGTH_SHORT,
            gravity: ToastGravity.CENTER,
            timeInSecForIosWeb: 3,
            backgroundColor: Colors.blue,
            textColor: Colors.white,
            fontSize: 16.0);
    });

    //testing functions
    //call_function(ParkingType.UNKNOWN, currentLocation);
    //get_parkings(currentLocation);
  }

  @override
  dispose() {
    super.dispose();
    activityRecognition.dispose();
    sensorRecognition.dispose();
  }

  IconData getMarkerType() {
    switch (markerActivity) {
      case ar.ActivityType.IN_VEHICLE:
        return Icons.navigation;
      case ar.ActivityType.WALKING:
        return Icons.circle;
      default:
        return Icons.my_location; //Case: STILL, UNKNOWN
    }
  }

  @override
  Widget build(BuildContext context) {
    return FlutterMap(
      options: MapOptions(
        center: currentLocation,
        zoom: 18,
        onTap: (tapPosition, point) async => {
          freeParking = await getParkings(point),
          Fluttertoast.showToast(
              msg: "In this area we have " +
                  freeParking.toString() +
                  " free parking",
              toastLength: Toast.LENGTH_SHORT,
              gravity: ToastGravity.BOTTOM,
              timeInSecForIosWeb: 1,
              backgroundColor: (freeParking != null && freeParking! > 0)
                  ? Colors.green
                  : Colors.red,
              textColor: Colors.white,
              fontSize: 14.0),
        },
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
        ]),
        MarkerLayer(markers: markers),
        Container(
            alignment: Alignment.bottomCenter,
            child: Row(
              //mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton(
                    onPressed: () {
                      sensorRecognition.dispose();
                    },
                    child: const Text('Stop Listen')),
                ElevatedButton(
                    style: ButtonStyle(
                        backgroundColor:
                            (userActivitySel! == userActivity.STILL)
                                ? MaterialStateProperty.all(Colors.green)
                                : MaterialStateProperty.all(Colors.blue)),
                    onPressed: () {
                      dev.log("STILL");
                      //sendActivity(ParkingType.EXITING, LatLng(44.496462, 11.355446), context);
                      sendActivity(
                          ParkingType.EXITING, currentLocation, context);
                      setState(() {
                        userActivitySel = userActivity.STILL;
                      });
                    },
                    child: const Text('STILL/Exit')),
                ElevatedButton(
                    style: ButtonStyle(
                        backgroundColor:
                            (userActivitySel! == userActivity.WALKING)
                                ? MaterialStateProperty.all(Colors.green)
                                : MaterialStateProperty.all(Colors.blue)),
                    onPressed: () {
                      //sendActivity(ParkingType.ENTERING, LatLng(44.496462, 11.355446), context);
                      sendActivity(
                          ParkingType.ENTERING, currentLocation, context);
                      setState(() {
                        userActivitySel = userActivity.WALKING;
                      });
                    },
                    child: const Text('WALKING/Enter')),
                ElevatedButton(
                    style: ButtonStyle(
                        backgroundColor:
                            (userActivitySel! == userActivity.DRIVING)
                                ? MaterialStateProperty.all(Colors.green)
                                : MaterialStateProperty.all(Colors.blue)),
                    onPressed: () {
                      setState(() {
                        userActivitySel = userActivity.DRIVING;
                      });
                    },
                    child: const Text('DRIVING')),
                ElevatedButton(
                    style: ButtonStyle(
                        backgroundColor:
                            (userActivitySel! == userActivity.DRIVING)
                                ? MaterialStateProperty.all(Colors.green)
                                : MaterialStateProperty.all(Colors.blue)),
                    onPressed: () {
                      drawMarkersOnMap();
                    },
                    child: const Text('UpdateMarkers'))
              ],
            )),
      ], //Children
    );
  }
}
