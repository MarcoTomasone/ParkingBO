import 'dart:developer' as dev;
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_activity_recognition/flutter_activity_recognition.dart';

const url = 'http://192.168.1.67:8000';

Future<http.Response> sendUserActivity(Activity activity) async {
  final request = {'type': activity.type.toString(), 'confidence': activity.confidence.toString()};
  final response = await http.post(
    Uri.parse('${url}/sendActivity'),
    body:  json.encode(request),
    headers: {
      "Content-Type": "application/json",
      "Accept" : "application/json"
    }
  );
  if (response.statusCode == 200) {
    // If the server did return a 200 CREATED response,
    dev.log("The user's activity was sent successfully");
  } else {
    // If the server did not return a 201 CREATED response,
    // then throw an exception.
    throw Exception('Failed to send activity');
  };
  return response;
}
