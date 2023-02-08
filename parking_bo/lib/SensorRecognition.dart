import 'dart:convert';
import 'dart:ffi';
import 'dart:math';
import 'package:flutter/cupertino.dart';
import 'package:flutter_sensors/flutter_sensors.dart';
import 'dart:async';
import 'dart:developer' as dev; //Just for debug
import 'utils/SaveFile.dart';

class SensorRecognition {

  Duration TIME_STEP = Duration(seconds: 5); 
  int GYROSCOPE_UNCALIBRATED = 16;

  StreamSubscription? _accelerometerSubscription = null;
  StreamSubscription? _gyroscopeSubscription = null;
  StreamSubscription? _gyroscopeUncalibratedSubscription = null;
  bool _accelerometerAvailable = false;
  bool _gyroscopeAvailable = false;
  bool _gyroscopeUncalibratedAvailable = false;
  List<double> _accelerometerMagnitude = [];
  List<double> _gyroscopeMagnitude = [];
  List<double> _gyroscopeUncalibratedMagnitude = [];
  List<Map<String, dynamic>> dataset = [];
 
  SensorRecognition()  {
      dev.log("SensorRecognition constructor");
      _checkAccelerometerStatus();
      _checkGyroscopeStatus();
      _checkGyroscopeUncalibratedStatus();
  }

  void _checkAccelerometerStatus() async {
    await SensorManager()
        .isSensorAvailable(Sensors.ACCELEROMETER)
        .then((result) {
          _accelerometerAvailable = result;
          if(_accelerometerAvailable)
            _startAccelerometer();
          dev.log("Accelerometer available: $_accelerometerAvailable");
        });
  }

  void _checkGyroscopeStatus() async {
    await SensorManager().isSensorAvailable(Sensors.GYROSCOPE).then((result) {
      _gyroscopeAvailable = result;
      if(_gyroscopeAvailable)
        _startGyroscope();
      dev.log("Gyroscope available: $_gyroscopeAvailable");
      
    });
  }

  void _checkGyroscopeUncalibratedStatus() async {
    await SensorManager()
        .isSensorAvailable(GYROSCOPE_UNCALIBRATED)
        .then((result) {
      _gyroscopeUncalibratedAvailable = result;
      if(_gyroscopeUncalibratedAvailable)
        _startGyroscopeUncalibrated();
      dev.log("Gyroscope Uncalibrated available: $_gyroscopeUncalibratedAvailable");
    });
  }

  Future<void> _startAccelerometer() async {

    if (_accelerometerSubscription != null) return;
    if (_accelerometerAvailable) {
      dev.log("Starting accelerometer");
      final stream = await SensorManager().sensorUpdates(
        sensorId: Sensors.ACCELEROMETER,
        interval: TIME_STEP,
      );
      _accelerometerSubscription = stream.listen((sensorEvent) {
          _accelerometerMagnitude.add(_computeMagnitude(sensorEvent.data));
         
      });
    }
  }

  Future<void> _startGyroscope() async {
    if (_gyroscopeSubscription != null) return;
    if (_gyroscopeAvailable) {
      dev.log("Starting gyroscope");
      final stream = await SensorManager().sensorUpdates(
        sensorId: Sensors.GYROSCOPE,
        interval: TIME_STEP,
      );
      _gyroscopeSubscription = stream.listen((sensorEvent) {
          _gyroscopeMagnitude.add(_computeMagnitude(sensorEvent.data));
      });
    }
  }

  Future<void> _startGyroscopeUncalibrated() async {
    if (_gyroscopeUncalibratedSubscription != null) return;
    if (_gyroscopeUncalibratedAvailable) {
      final stream = await SensorManager().sensorUpdates(
        sensorId: GYROSCOPE_UNCALIBRATED,
        interval: TIME_STEP,
      );
      _gyroscopeUncalibratedSubscription = stream.listen((sensorEvent) {
          _gyroscopeUncalibratedMagnitude.add(_computeMagnitude(sensorEvent.data));
      });
    }
  }


  void _stopAccelerometer() {
    if (_accelerometerSubscription == null) return;
    _accelerometerSubscription?.cancel();
    _accelerometerSubscription = null;
  }

  void _stopGyroscope() {
    if (_gyroscopeSubscription == null) return;
    _gyroscopeSubscription?.cancel();
    _gyroscopeSubscription = null;
  }

  void _stopGyroscopeUncalibrated() {
    if (_gyroscopeUncalibratedSubscription == null) return;
    _gyroscopeUncalibratedSubscription?.cancel();
    _gyroscopeUncalibratedSubscription = null;
  }

  @override
  void dispose() {
    _stopAccelerometer();
    _stopGyroscope();
    _stopGyroscopeUncalibrated();
    SaveFile.writeToFile(jsonEncode(dataset));
    
  }

  //Function to compute Magnitude of a 3D vector
  double _computeMagnitude(List<double> vector) {
    return sqrt(pow(vector[0], 2) + pow(vector[1], 2) + pow(vector[2], 2));
  }
   
  //Function to compute standard deviation of a list of values
  double standardDeviation(List<double> values) {
    double mean = values.reduce((a, b) => a + b) / values.length;
    double sum = 0;
    for (int i = 0; i < values.length; i++) {
      sum += pow(values[i] - mean, 2);
    }
    return sqrt(sum / values.length);
  }

  void getRow(String userTarget, String libTarget) {
    
    if(_accelerometerMagnitude.length > 0 && _gyroscopeMagnitude.length > 0 && _gyroscopeUncalibratedMagnitude.length > 0){
      Map<String, dynamic> row = 
      { 'accelometer#mean': _accelerometerMagnitude.reduce((a, b) => a + b) / _accelerometerMagnitude.length,
        'accelometer#max': _accelerometerMagnitude.reduce(max),
        'accelometer#min': _gyroscopeMagnitude.reduce(min),
        'accelometer#std': standardDeviation(_accelerometerMagnitude),
        'gyroscope#mean': _gyroscopeMagnitude.reduce((a, b) => a + b) / _gyroscopeMagnitude.length,
        'gyroscope#max': _gyroscopeMagnitude.reduce(max),
        'gyroscope#min': _gyroscopeMagnitude.reduce(min),
        'gyroscope#std': standardDeviation(_gyroscopeUncalibratedMagnitude),
        'gyroscopeUncalibrated#mean': _gyroscopeUncalibratedMagnitude.reduce((a, b) => a + b) / _gyroscopeUncalibratedMagnitude.length,
        'gyroscopeUncalibrated#max': _gyroscopeUncalibratedMagnitude.reduce(max),
        'gyroscopeUncalibrated#min': _gyroscopeUncalibratedMagnitude.reduce(min),
        'gyroscopeUncalibrated#std':  standardDeviation(_gyroscopeUncalibratedMagnitude),
        'userTarget': userTarget,
        'libTarget' : libTarget,
      };

      _accelerometerMagnitude.clear();
      _gyroscopeMagnitude.clear();
      _gyroscopeUncalibratedMagnitude.clear();
      dataset.add(row);
    }
  }
}
