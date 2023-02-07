import 'package:ParkingBO/utils/CollectionSensor.dart';
import 'package:ParkingBO/utils/SensorsClass.dart';
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
import 'package:flutter_activity_recognition/flutter_activity_recognition.dart'
    as ar;
import 'package:fluttertoast/fluttertoast.dart';
import 'dart:async';
import 'dart:convert';
import 'utils/SaveFile.dart';
import './utils/SensorsClass.dart';
import 'utils/CollectionAxis.dart';

final LocationSettings locationSettings = LocationSettings(
  accuracy: LocationAccuracy.high,
  distanceFilter: 1,
);

enum userActivity { DRIVING, WALKING }

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
  LatLng currentLocation =
      LatLng(44.493754, 11.343095); //Coordinates of Bologna
  late CenterOnLocationUpdate _centerOnLocationUpdate;
  late ActivityRecognition activityRecognition;
  Timer? timer;
  StreamSubscription? accel;
  StreamSubscription? gyro;
  StreamSubscription? magnetometer;
  StreamSubscription? userAccelerometer;

  List<Map<String, double>> accelerometerList = [];
  List<Map<String, double>> gyroscopeList = [];
  List<Map<String, double>> magnetometerList = [];
  List<Map<String, double>> uAccelerometerList = [];
  List<SensorClass> general = [];

  CollectionSensor meanList = CollectionSensor();
  CollectionSensor stdList = CollectionSensor();
  CollectionSensor maxList = CollectionSensor();
  CollectionSensor minList = CollectionSensor();

  void updateCurrentActivity(ar.ActivityType activityType) {
    List<Map<String, String>> target = [
      {
        "expected": userActivitySel.toString(),
        "detected": activityType.toString()
      }
    ];

    
    SensorClass list = SensorClass( maxList,minList,stdList,meanList,target);

    general.add(list);
    print(general);
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
    Map<String, dynamic> chargers = await getChargingStations();
    for (var element in chargers["chargers"]) {
      setState(() {
        markers.add(
          Marker(
              point: LatLng(element["y"], element["x"]),
              builder: (ctx) => Icon(
                    Icons.location_pin,
                    color: element["n_charging_points_available"] > 2
                        ? Colors.green
                        : Colors
                            .red, //TODO: change control to > 0 when the database will be updated
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
    drawPolygonsOnMap();
    createLocationListener();
    //drawMarkersOnMap();
    //testing functions
    //call_function(ParkingType.UNKNOWN, currentLocation);
    //get_parkings(currentLocation);
  }

  @override
  dispose() {
    super.dispose();
    activityRecognition.dispose();
  }

  IconData getMarkerType() {
    //TODO: switch instead of if
    if (currentActivity == ar.ActivityType.IN_VEHICLE)
      return Icons.navigation; // CASE: DRIVING
    else if (currentActivity == ar.ActivityType.WALKING)
      return Icons.circle; // CASE: Walking
    else
      return Icons.my_location; //CASE: Still, Unknown
  }

  Future<void> listen_sensor() async {
    print("=====================Start Listen Sensor=====================");

    CollectionSensor collection = new CollectionSensor();
    accel = accelerometerEvents.listen((AccelerometerEvent event) {
      collection.addAccelerometerList(event.x, event.y, event.z);
      //accelerometerList.add({'x': event.x, 'y': event.y, 'z': event.z});
      //accel?.pause();
    });
    // [AccelerometerEvent (x: 0.0, y: 9.8, z: 0.0)]

    userAccelerometer =
        userAccelerometerEvents.listen((UserAccelerometerEvent event) {
      collection.addUAccelerometerList(event.x, event.y, event.z);
      //uAccelerometerList.add({'x': event.x, 'y': event.y, 'z': event.z});
      //userAccelerometer?.pause();
    });
    // [UserAccelerometerEvent (x: 0.0, y: 0.0, z: 0.0)]

    gyro = gyroscopeEvents.listen((GyroscopeEvent event) {
      collection.addGyroscopeList(event.x, event.y, event.z);

      //gyroscopeList.add({'x': event.x, 'y': event.y, 'z': event.z});
      ///gyro?.pause();
    });
    // [GyroscopeEvent (x: 0.0, y: 0.0, z: 0.0)]

    magnetometer = magnetometerEvents.listen((MagnetometerEvent event) {
      collection.addMagnetometerList(event.x, event.y, event.z);
      //magnetometerList.add({'x': event.x, 'y': event.y, 'z': event.z});
      //magnetometer?.pause();
    });

    if (timer == null) {
      timer = Timer.periodic(Duration(seconds: 1), (timer) {
        /*gyro?.resume();
        magnetometer?.resume();
        userAccelerometer?.resume();
        accel?.resume();*/

        collection.step(maxList, minList, meanList, stdList);
      });
    }
  }

  void stop_sensor() {
    print("=======================Stop Listen Sensor====================");
    accel?.cancel();
    userAccelerometer?.cancel();
    gyro?.cancel();
    magnetometer?.cancel();

    SaveFile.writeToFile(jsonEncode(general));
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
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton(
                    onPressed: () {
                      setState(() {
                        start_listen = !start_listen;
                      });
                      start_listen ? listen_sensor() : stop_sensor();
                    },
                    child: start_listen
                        ? const Text('Stop Listen')
                        : const Text('Listen Sensor')),
                ElevatedButton(
                    style: ButtonStyle(
                        backgroundColor:
                            (userActivitySel! == userActivity.WALKING)
                                ? MaterialStateProperty.all(Colors.green)
                                : MaterialStateProperty.all(Colors.blue)),
                    onPressed: () {
                      setState(() {
                        userActivitySel = userActivity.WALKING;
                      });
                    },
                    child: const Text('WALKING')),
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
              ],
            ))
      ], //Children
    );
  }
}
