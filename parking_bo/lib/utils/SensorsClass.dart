class SensorClass {
    List<Map<String, double>> accelerometerList;
    List<Map<String, double>> gyroscopeList;
    List<Map<String, double>> magnetometerList;
    List<Map<String, double>> uAccelerometerList;
    List<String> target;

    SensorClass(this.accelerometerList, this.gyroscopeList, this.magnetometerList, this.uAccelerometerList, this.target);

    Map<String, dynamic> toJson() => {
        'accelerometerList': accelerometerList,
        'gyroscopeList': gyroscopeList,
        'magnetometerList': magnetometerList,
        'uAccelerometerList': uAccelerometerList,
        'target': target,
    };
  } 