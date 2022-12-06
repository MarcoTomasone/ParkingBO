import 'dart:developer' as dev;
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:latlong2/latlong.dart';
import 'newTypes.dart';
import 'package:flutter_activity_recognition/flutter_activity_recognition.dart';

//Per fare localhost su real mobile ci va l'ip del computer su cui fate girare il server
//Per fare localhost sull'emulatore dovrebbe andare il seguente ip = 10.0.2.2
const url = 'http://192.168.45.34:8000';

/**
 * This function is used to send to the server the users's activity
 */
Future<http.Response> sendTransition(ParkingType type, LatLng position) async {
  final request = {'type': type.toString(), 'position': position.toJson()};
  final response = await http.post(Uri.parse('${url}/sendTransition'),
      body: json.encode(request),
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      });
  if (response.statusCode == 200) {
    // If the server did return a 200 CREATED response,
    dev.log("The user's transition was sent successfully");
  } else {
    // then throw an exception.
    throw Exception('Failed to send transition');
  };
  return response;
}

