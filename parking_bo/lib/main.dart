import 'package:ParkingBO/HomePage.dart';
import 'package:ParkingBO/MapWidget.dart';
import 'package:ParkingBO/SplashScreen.dart';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {


  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    //checkPermissions();
    return MaterialApp(
      title: 'ParkingBO',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: SplashScreen(),
    );
  }
}