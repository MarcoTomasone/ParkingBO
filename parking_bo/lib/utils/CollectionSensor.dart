import 'package:sensors_plus/sensors_plus.dart';

import 'CollectionAxis.dart';

class CollectionSensor {
  CollectionAxis accelerometerList = new CollectionAxis();
  CollectionAxis uAccelerometerList = new CollectionAxis();
  CollectionAxis gyroscopeList = new CollectionAxis();
  CollectionAxis magnetometerList = new CollectionAxis();

  CollectionSensor();

  getAccelerometerList() {
    return accelerometerList;
  }

  getGyroscopeList() {
    return gyroscopeList;
  }

  getMagnetometerList() {
    return magnetometerList;
  }

  getUAccelerometerList() {
    return uAccelerometerList;
  }

  addAccelerometerList(double x, double y, double z) {
    accelerometerList.add(x, y, z);
  }

  addGyroscopeList(double x, double y, double z) {
    gyroscopeList.add(x, y, z);
  }

  addMagnetometerList(double x, double y, double z) {
    magnetometerList.add(x, y, z);
  }

  addUAccelerometerList(double x, double y, double z) {
    uAccelerometerList.add(x, y, z);
  }

  mean(CollectionSensor general) {
    //calcolate mean and standard deviation
    general.addAccelerometerList(
        CollectionAxis.mean(accelerometerList.getAxis_x()),
        CollectionAxis.mean(accelerometerList.getAxis_y()),
        CollectionAxis.mean(accelerometerList.getAxis_z()));
    general.addGyroscopeList(
        CollectionAxis.mean(gyroscopeList.getAxis_x()),
        CollectionAxis.mean(gyroscopeList.getAxis_y()),
        CollectionAxis.mean(gyroscopeList.getAxis_z()));
    general.addMagnetometerList(
        CollectionAxis.mean(magnetometerList.getAxis_x()),
        CollectionAxis.mean(magnetometerList.getAxis_y()),
        CollectionAxis.mean(magnetometerList.getAxis_z()));
    general.addUAccelerometerList(
        CollectionAxis.mean(uAccelerometerList.getAxis_x()),
        CollectionAxis.mean(uAccelerometerList.getAxis_y()),
        CollectionAxis.mean(uAccelerometerList.getAxis_z()));
  }

  min(CollectionSensor general) {
    general.addAccelerometerList(
        CollectionAxis.min(accelerometerList.getAxis_x()),
        CollectionAxis.min(accelerometerList.getAxis_y()),
        CollectionAxis.min(accelerometerList.getAxis_z()));
    general.addGyroscopeList(
        CollectionAxis.min(gyroscopeList.getAxis_x()),
        CollectionAxis.min(gyroscopeList.getAxis_y()),
        CollectionAxis.min(gyroscopeList.getAxis_z()));
    general.addMagnetometerList(
        CollectionAxis.min(magnetometerList.getAxis_x()),
        CollectionAxis.min(magnetometerList.getAxis_y()),
        CollectionAxis.min(magnetometerList.getAxis_z()));
    general.addUAccelerometerList(
        CollectionAxis.min(uAccelerometerList.getAxis_x()),
        CollectionAxis.min(uAccelerometerList.getAxis_y()),
        CollectionAxis.min(uAccelerometerList.getAxis_z()));
  }

  max(CollectionSensor general) {
    general.addAccelerometerList(
        CollectionAxis.max(accelerometerList.getAxis_x()),
        CollectionAxis.max(accelerometerList.getAxis_y()),
        CollectionAxis.max(accelerometerList.getAxis_z()));
    general.addGyroscopeList(
        CollectionAxis.max(gyroscopeList.getAxis_x()),
        CollectionAxis.max(gyroscopeList.getAxis_y()),
        CollectionAxis.max(gyroscopeList.getAxis_z()));
    general.addMagnetometerList(
        CollectionAxis.max(magnetometerList.getAxis_x()),
        CollectionAxis.max(magnetometerList.getAxis_y()),
        CollectionAxis.max(magnetometerList.getAxis_z()));
    general.addUAccelerometerList(
        CollectionAxis.max(uAccelerometerList.getAxis_x()),
        CollectionAxis.max(uAccelerometerList.getAxis_y()),
        CollectionAxis.max(uAccelerometerList.getAxis_z()));
  }

  standardDeviation(CollectionSensor general) {
    general.addAccelerometerList(
        CollectionAxis.standardDeviation(accelerometerList.getAxis_x()),
        CollectionAxis.standardDeviation(accelerometerList.getAxis_y()),
        CollectionAxis.standardDeviation(accelerometerList.getAxis_z()));

    general.addGyroscopeList(
        CollectionAxis.standardDeviation(gyroscopeList.getAxis_x()),
        CollectionAxis.standardDeviation(gyroscopeList.getAxis_y()),
        CollectionAxis.standardDeviation(gyroscopeList.getAxis_z()));

    general.addMagnetometerList(
        CollectionAxis.standardDeviation(magnetometerList.getAxis_x()),
        CollectionAxis.standardDeviation(magnetometerList.getAxis_y()),
        CollectionAxis.standardDeviation(magnetometerList.getAxis_z()));

    general.addUAccelerometerList(
        CollectionAxis.standardDeviation(uAccelerometerList.getAxis_x()),
        CollectionAxis.standardDeviation(uAccelerometerList.getAxis_y()),
        CollectionAxis.standardDeviation(uAccelerometerList.getAxis_z()));
  }

  step(CollectionSensor maxList, CollectionSensor minList,
      CollectionSensor meanList, CollectionSensor stdList) {
    //calcolate step
    mean(meanList);
    min(minList);
    max(maxList);
    standardDeviation(stdList);

    clear();
  }

  void clear() {
    accelerometerList.reset();
    gyroscopeList.reset();
    magnetometerList.reset();
    uAccelerometerList.reset();
  }

  List<Map<String,dynamic>> toJson() {
    return [
      {'accelerometer': accelerometerList},
      {'gyroscope': gyroscopeList},
      {'magnetometer': magnetometerList},
      {'uAccelerometer': uAccelerometerList},
    ];
  }
}
