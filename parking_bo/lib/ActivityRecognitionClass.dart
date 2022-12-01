import 'dart:async';
import 'dart:developer' as dev;

import 'package:flutter/material.dart';
import 'package:flutter_activity_recognition/flutter_activity_recognition.dart';
import './utils/httpRequest.dart';
import './utils/newTypes.dart';

class ActivityRecognition {
  //final _activityStreamController = StreamController<Activity>();  //TODO: ???????????
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
    // Subscribe to the activity stream.
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

  void detectTransition(Activity activity) {
    ActivityType currentActivity = activity.type;
    if(currentActivity != lastActivity) {
      //We are exiting a parking lot
      if(lastActivity == ActivityType.WALKING && currentActivity == ActivityType.IN_VEHICLE) {
        sendTransition(ParkingType.EXITING);
      }
      //We just parked
      else if(lastActivity == ActivityType.IN_VEHICLE && currentActivity == ActivityType.WALKING) {
        sendTransition(ParkingType.ENTERING);
      }
    }
  }

  void _onActivityReceive(Activity activity) async {
    debugPrint('Activity Detected >> ${activity.toJson()}');
    //Took only the activities that interest us
    if((activity.type == ActivityType.WALKING || activity.type == ActivityType.IN_VEHICLE) && activity.confidence == ActivityConfidence.HIGH) {
      lastActivity = activity.type;
      detectTransition(activity);
    }
    updateCurrentActivity(activity.type);
    //_activityStreamController.sink.add(activity); //TODO: Update _currentActivity in MapWidget to rebuild the marker 
  }
 
  void dispose() {
    activityStreamSubscription?.cancel();
  }
  
}



