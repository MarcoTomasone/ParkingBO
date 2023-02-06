import 'dart:developer' as dev;
import 'dart:convert';
//import 'dart:html';
import 'dart:io';
//import 'dart:js_util';
import 'package:http/http.dart' as http;
import 'package:latlong2/latlong.dart';
import 'utils.dart';
import 'package:flutter_activity_recognition/flutter_activity_recognition.dart';

//Per fare localhost su real mobile ci va l'ip del computer su cui fate girare il server
//Per fare localhost sull'emulatore dovrebbe andare il seguente ip = 10.0.2.2
const url = 'http://192.168.146.34:8000';

/**
 * This function is used to send a transition to the server
 */
Future<String?> sendTransition(String? id, ParkingType type, LatLng position) async {
  final request = {'id_user': id, 'type': type.name, 'position': position.toJson()};
  final response = await http.post(Uri.parse('${url}/sendTransition'),
      body: json.encode(request),
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      });
  if (response.statusCode == 200) {
    // If the server did return a 200 CREATED response,
    dev.log("The user's transition was sent successfully");
    Map<String, dynamic> map = json.decode(response.body);
    final id_user = map['id_user'].toString();
    return id_user;
  } else if (response.statusCode == 404) {
      dev.log("User is not in a parking zone");
      return null;
  }
  else {
    dev.log(response.body);
      throw Exception('Failed to send transition');
  }
}


/**
 * This function is used to get the parkings from the server
 * @param position is the position of the user
 */
Future<int?> getParkings(LatLng position) async {
  Map<String, dynamic> queryParameters = position.toJson();
  Map<String, String> stringQueryParameters = Map<String, String>();
  queryParameters.forEach((key, value) => stringQueryParameters[key] = value.toString());
  dev.log(stringQueryParameters.toString());

  final uri = Uri.http("192.168.146.34:8000", '/getParkingsFromPosition', stringQueryParameters);
  final response = await http.get(uri, headers: {
    HttpHeaders.contentTypeHeader: 'application/json',
  });
  if (response.statusCode == 200) {
    // If the server did return a 200 CREATED response,
    dev.log("The parkings were received successfully");
    Map<String, dynamic> map = json.decode(response.body);
    final parkings = map['parkings'];
    return parkings;
  } else {
    if(response.body == "User is not in a parking zone") {
      dev.log("User is not in a parking zone");
      return null;
    }
    else {
      dev.log(response.body);
      throw Exception('Failed to get parkings');
    }
  }

}

Future<Map<String, dynamic>> getChargingStations() async {
    final uri = Uri.http("192.168.50.149:8000", '/e-chargers');
    final response = await http.get(uri);
    if (response.statusCode == 200) {
      // If the server did return a 200 CREATED response,
      Map<String, dynamic> map = json.decode(response.body);
      //dev.log(map["chargers"].toString());
      return map;
    } else {
      dev.log(response.body);
      throw Exception('Failed to get charging stations');
    }
  }


