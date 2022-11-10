import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

final LocationSettings locationSettings = LocationSettings(
  accuracy: LocationAccuracy.high,
  distanceFilter: 100,
);

//Quando torna indietro nella schermata principale non mi prende piu la posizione
class CurrentLocation extends StatefulWidget {
  CurrentLocation({Key? key}) : super(key: key);

  @override
  _CurrentLocationState createState() => _CurrentLocationState();
}

class _CurrentLocationState extends State<CurrentLocation> {
  String currentLocation = "";

  @override
  void initState() {
    super.initState();
    _getPermissionLocation();
    if (currentLocation != "Permission Denied") {
      Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high)
          .then((Position? position) {
        setState(() {
          currentLocation = (position == null
              ? "Unknown"
              : "${position.latitude}, ${position.longitude}");
        });
      }).catchError((e) {
        print(e);
      });
      ;
    }
  }

  void _getPermissionLocation() async {
    LocationPermission permission;

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        setState(() {
          currentLocation = "Permission Denied";
        });
      }
    }
    ;
  }

  @override
  dispose() {
    debugPrint("dispose");
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Location"), centerTitle: true),
      body: SingleChildScrollView(
        child: Container(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: <Widget>[
              Container(
                  decoration: BoxDecoration(color: Colors.teal[50]),
                  padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Column(
                    children: <Widget>[
                      Row(
                        children: <Widget>[
                          Icon(Icons.location_on),
                          SizedBox(
                            width: 8,
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[Text(currentLocation)],
                            ),
                          ),
                          SizedBox(
                            width: 8,
                          ),
                        ],
                      ),
                    ],
                  )),
            ],
          ),
        ),
      ),
    );
  }
}
