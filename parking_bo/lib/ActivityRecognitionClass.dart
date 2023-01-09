import 'dart:async';
import 'dart:developer' as dev;
import 'package:geolocator/geolocator.dart' as geo;
import 'package:flutter/material.dart';
import 'package:flutter_activity_recognition/flutter_activity_recognition.dart' ;
import './utils/httpRequest.dart';
import 'utils/utils.dart';
import 'package:permission_handler/permission_handler.dart';
import './NoPermissionGrantsWidget.dart';

class ActivityRecognition {
  //Initially set the last activity to UNKNOWN
  ActivityType lastActivity = ActivityType.UNKNOWN;
  StreamSubscription<Activity>? _activityStreamSubscription;
  String activityList = '';
  final activityRecognition = FlutterActivityRecognition.instance;
  late final activityStreamSubscription; 
  late final Function updateCurrentActivity;

  //Class constructor
  ActivityRecognition(Function updateCurrentActivity){
    debugPrint("Activity Detected START LISTENER");
    this.updateCurrentActivity = updateCurrentActivity;
    isPermissionGrants();
    _activityStreamSubscription = activityRecognition.activityStream
    .handleError(_handleError)
    .listen(_onActivityReceive);
  }
  
  Future<bool> isPermissionGrants() async {
    // Check if the user has granted permission. If not, request permission.
    PermissionRequestResult reqResult;
    reqResult = await activityRecognition.checkPermission();
    if (reqResult == PermissionRequestResult.PERMANENTLY_DENIED) {
      dev.log('Permission is permanently denied.');
      return false;
    } else if (reqResult == PermissionRequestResult.DENIED) {
      reqResult = await activityRecognition.requestPermission();
      if (reqResult != PermissionRequestResult.GRANTED) {
        dev.log('Permission is denied.');
        return false;
      }
    }
    return true;
    } 

  void _handleError(dynamic error) {
    dev.log('Catch Error NON STO TRACCIANDO>> $error');
  }
//TODO: CANCEL IF NOT USED AT ALL
  /*void detectTransition(Activity activity) {
    ActivityType currentActivity = activity.type;
    if(currentActivity != lastActivity) {
      //We are exiting a parking lot
      if(lastActivity == ActivityType.WALKING && currentActivity == ActivityType.IN_VEHICLE) {
       // sendTransition(ParkingType.EXITING);
      }
      //We just parked
      else if(lastActivity == ActivityType.IN_VEHICLE && currentActivity == ActivityType.WALKING) {
       // sendTransition(ParkingType.ENTERING);
      }
    }
  }*/

  void _onActivityReceive(Activity activity) {
    debugPrint('Activity Detected >> ${activity.toJson()}');
    //Took only the activities that interest us
    if((activity.type == ActivityType.WALKING || activity.type == ActivityType.IN_VEHICLE) && activity.confidence == ActivityConfidence.HIGH) {
      lastActivity = activity.type;
      //detectTransition(activity); TODO: CANCEL IF NOT USED AT ALL
    }
    updateCurrentActivity(activity.type);
  }
 
  void dispose() {
    activityStreamSubscription?.cancel();
  }
  
}


