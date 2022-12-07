import 'package:flutter/material.dart';
import 'MapWidget.dart';

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
                child: Text('Map'),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) => MapWidget()),
                  );
                },
              ),
            ],
          ),
        ));
  }
}