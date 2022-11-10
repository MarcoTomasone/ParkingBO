import 'dart:async';
import 'dart:developer' as dev;

import 'package:flutter/material.dart';
import 'package:flutter_activity_recognition/flutter_activity_recognition.dart';
import './utils/httpRequest.dart';

void main() => runApp(ActivityRecognition());

class ActivityRecognition extends StatefulWidget {
  @override
  _ActivityRecognitionState createState() => _ActivityRecognitionState();
}

class _ActivityRecognitionState extends State<ActivityRecognition> {
  final _activityStreamController = StreamController<Activity>();
  StreamSubscription<Activity>? _activityStreamSubscription;
  String activityList = '';

  void _onActivityReceive(Activity activity) async {
    dev.log('Activity Detected >> ${activity.toJson()}');
    //if(activity.confidence == ActivityConfidence.HIGH)
      //sendUserActivity(activity);
    _activityStreamController.sink.add(activity);
  }

  void _handleError(dynamic error) {
    dev.log('Catch Error >> $error');
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance?.addPostFrameCallback((_) async {
      final activityRecognition = FlutterActivityRecognition.instance;

      // Check if the user has granted permission. If not, request permission.
      PermissionRequestResult reqResult;
      reqResult = await activityRecognition.checkPermission();
      if (reqResult == PermissionRequestResult.PERMANENTLY_DENIED) {
        dev.log('Permission is permanently denied.');
        return;
      } else if (reqResult == PermissionRequestResult.DENIED) {
        reqResult = await activityRecognition.requestPermission();
        if (reqResult != PermissionRequestResult.GRANTED) {
          dev.log('Permission is denied.');
          return;
        }
      }

      // Subscribe to the activity stream.
      _activityStreamSubscription = activityRecognition.activityStream
          .handleError(_handleError)
          .listen(_onActivityReceive);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Text('Activity Recognition'),
          centerTitle: true
        ),
        body: _buildContentView()
    );
  }

  @override
  void dispose() {
    _activityStreamController.close();
    _activityStreamSubscription?.cancel();
    super.dispose();
  }

  Widget _buildContentView() {
    return StreamBuilder<Activity>(
      stream: _activityStreamController.stream,
      builder: (context, snapshot) {
        final updatedDateTime = DateTime.now();
        final content = snapshot.data?.toJson().toString() ?? '';
        final time = updatedDateTime.hour.toString() + ":" + updatedDateTime.minute.toString() + ":" + updatedDateTime.second.toString();
        activityList += content == '' ? '' :content + " at " + time + "\n";

        return ListView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(8.0),
          children: [
            Text('•\t\tActivity (updated: $updatedDateTime)'),
            SizedBox(height: 10.0),
            Text(activityList)
          ]
        );
      }
    );
  }
}
