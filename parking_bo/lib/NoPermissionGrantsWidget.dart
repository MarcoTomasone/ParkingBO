
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class NoPermissionGrantsWidget extends StatelessWidget{
  
  
  @override
  Widget build(BuildContext context) {
  return Scaffold(
      body: SizedBox(
        width: double.infinity,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
           
              Text('You have to give permissions', style: TextStyle(fontSize: 30)),
          ],
        ),
      )
    );
  }
}
 

  
