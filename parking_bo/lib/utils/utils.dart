import 'dart:ffi';
import 'package:flutter/cupertino.dart';
import 'package:http/http.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ParkingBO/utils/httpRequest.dart';
import 'package:latlong2/latlong.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:flutter/material.dart';
import 'dart:developer' as dev;


/**
 * This enum is used to define the type of the transition
 */
enum ParkingType {
  ENTERING,
  EXITING
}



/**
 * This function is used to do the call to the server
 * @param id_user is the id of the user
 * @param type is the type of the transition
 * */
void sendActivity (ParkingType type, LatLng position, BuildContext context) async {
  final id_user = await getId();
  final response = await sendTransition(id_user, type, position);
  //If the user is in a parking zone, the id is saved in the shared preferences
  dev.log("RESPONSE: " + response.toString());
  if(response == null ){
    Fluttertoast.showToast(
    msg: "User is not in a parking zone",
    toastLength: Toast.LENGTH_SHORT,
    gravity: ToastGravity.CENTER,
    timeInSecForIosWeb: 3,
    backgroundColor: Colors.black,
    textColor: Colors.white,
    fontSize: 16.0);
  }
  else if (response[0] != id_user) {
      dev.log("Received ID: " + response[0]);
      dev.log("my ID: " + id_user.toString());
      setId(response[0]);
  }

  if(response?[1] != null) {
    showElectricChargerAlertDialog(context, response?[1]);
  }
}

void get_parkings (LatLng position) async {
  final response = await getParkings(position);
  dev.log(response.toString());
  //If the user is in a parking zone, the id is saved in the shared preferences
  if(response == null) {
    Fluttertoast.showToast(
    msg: "User is not in a parking zone",
    toastLength: Toast.LENGTH_SHORT,
    gravity: ToastGravity.CENTER,
    timeInSecForIosWeb: 3,
    backgroundColor: Colors.black,
    textColor: Colors.white,
    fontSize: 16.0);
  }
  else {
    Fluttertoast.showToast(
    msg: "Number of parking in this zone: $response",
    toastLength: Toast.LENGTH_SHORT,
    gravity: ToastGravity.CENTER,
    timeInSecForIosWeb: 3,
    backgroundColor: Colors.black,
    textColor: Colors.white,
    fontSize: 16.0);
  }
}

/**------------------------------------------------------Shared Preferences---------------------------------------------------- */

/**
 * This function is used to check and create the shared preferences
 */
Future<void> checkSharedPreferences(id_user) async {
  bool check = await checkId();
  if (!check) {
    await setId(id_user);
  }
}

/**
 * This function is used to set the id of the user
 */
Future<void> setId(String? id_user) async {
  SharedPreferences prefs = await SharedPreferences.getInstance();
  prefs.setString('id_user', id_user.toString());
}

/**
 * This function is used to check if id key is present in the shared preferences
 */
Future<bool> checkId() async {
  SharedPreferences prefs = await SharedPreferences.getInstance();
  String? id_user = prefs.getString('id_user');
  if (id_user == null)
    return false;
  else
    return true;
}

/**
 * This function is used to get the id of the user
 */
Future<String?> getId() async {
  SharedPreferences prefs = await SharedPreferences.getInstance();
  String? id_user = prefs.getString('id_user');
  if (id_user == "null") {
    setId(null);
    return null;
  }
  else
    return id_user;
}

showElectricChargerAlertDialog(BuildContext context, int id_station) {
  // set up the buttons
  Widget cancelButton = ElevatedButton(
    child: Text("No"),
    onPressed:  () {Navigator.pop(context);},
  );
  Widget continueButton = ElevatedButton(
    child: Text("Yes"),
    onPressed:  ()  {
      getId().then((value) => useChargingStation(value.toString(), id_station)); 
      Navigator.pop(context); }, 
  );
  // set up the AlertDialog
  AlertDialog alert = AlertDialog(
    title: Text("Detected electric charging station"),
    content: Text("Are you using this electric charging station?"),
    actions: [
      cancelButton,
      continueButton,
    ],
  );
  // show the dialog
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return alert;
    },
  );
}
