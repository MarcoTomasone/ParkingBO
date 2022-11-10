import 'package:flutter/cupertino.dart';

enum ParkingType {
  ENTERING,
  EXITING
}

class Position {
  var latitude;
  var longitude;

  Map<Key,String> toJson() => {latitude: latitude, longitude: longitude};
}
