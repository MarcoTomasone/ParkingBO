import 'package:flutter/material.dart';
import 'ActivityRecognition.dart';
import 'PositionRecognition.dart';

class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Text('Home Page'),
        ),
        body: Center(
          child: Column(
            children: <Widget>[
              ElevatedButton(
                child: Text('Activity Recognition'),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) => ActivityRecognitionApp()),
                  );
                },
              ),
              ElevatedButton(
                child: Text('Position Recognition'),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) => CurrentLocation()),
                  );
                },
              ),
            ],
          ),
        ));
  }
}
