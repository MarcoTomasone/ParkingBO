
import 'package:ParkingBO/MapWidget.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class SplashScreen extends StatefulWidget{
  const SplashScreen({Key? key}) : super(key : key);
  
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}
//TODO: Use spinkit to add animation https://www.youtube.com/watch?v=CHYKlj-wawI
class _SplashScreenState extends State<SplashScreen>{

  @override
  void initState() {
    super.initState();
    Future.delayed(Duration(seconds: 3)).then((value){
      Navigator.of(context).pushReplacement(CupertinoPageRoute(
        builder: (ctx) =>  MapWidget()
      ));
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
              width: 200, )
          ],
        ),
      )
    );
  }

}