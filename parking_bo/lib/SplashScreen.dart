
import 'package:ParkingBO/MapWidget.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
class SplashScreen extends StatefulWidget{
  const SplashScreen({Key? key}) : super(key : key);
  
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}
//TODO: Use spinkit to add animation https://www.youtube.com/watch?v=CHYKlj-wawI
class _SplashScreenState extends State<SplashScreen>{

   Future<bool> checkPermissions() async {
    Map<Permission, PermissionStatus> statuses = await[
      Permission.location,
      Permission.activityRecognition,
    ].request();

    bool allGranted = true;

    statuses.forEach((key, value) { 
      if( value != PermissionStatus.granted)
        allGranted = false;
    });

    debugPrint(allGranted.toString());
    return true;
}
  //TODO: If not permission load another activity
  @override
  void initState() {
    super.initState();
    checkPermissions().whenComplete( () => {
      Future.delayed(Duration(seconds: 1)).then((value){
        Navigator.of(context).pushReplacement(CupertinoPageRoute(
          builder: (ctx) =>  MapWidget()
        ));
      })
  });
  }
  
  @override
  Widget build(BuildContext context) {
   return Scaffold(
      body: SizedBox(
        width: double.infinity,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            Image(
              image: AssetImage('assets/logo.png'), 
              width: 200, ),
              Text('Parking BO', style: TextStyle(fontSize: 30)),
          ],
        ),
      )
    );
  }

}