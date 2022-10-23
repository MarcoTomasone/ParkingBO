import 'package:flutter/material.dart';
import 'ActivityRecognition.dart';
class HomePage extends StatelessWidget{
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Home Page'),
      ),
      body: Center(
        child: ElevatedButton(
          child: const Text('Activity Recognition'),
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) =>  ActivityRecognitionApp()),
            );
          },
        ),
      ),
    );
  }
}