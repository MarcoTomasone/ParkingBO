import 'package:ParkingBO/utils/CollectionSensor.dart';

class SensorClass {
    CollectionSensor max;
    CollectionSensor min;
    CollectionSensor std;
    CollectionSensor mean;
    List<Map<String, String>> target;

    SensorClass(this.max, this.min, this.std, this.mean, this.target);

    Map<String, dynamic> toJson() => {
        'max': max,
        'min': min,
        'std': std,
        'mean': mean,
        'target': target,
    };
  } 