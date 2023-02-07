import 'dart:math';
import 'package:flutter/cupertino.dart';

class CollectionAxis {
  List<double> axis_x = [];
  List<double> axis_y = [];
  List<double> axis_z = [];

  CollectionAxis();

  getAxis_x() {
    return axis_x;
  }

  getAxis_y() {
    return axis_y;
  }

  getAxis_z() {
    return axis_z;
  }

  addAxis_x(double value) {
    axis_x.add(value);
  }

  addAxis_y(double value) {
    axis_y.add(value);
  }

  addAxis_z(double value) {
    axis_z.add(value);
  }

  add(double x, double y, double z) {
    axis_x.add(x);
    axis_y.add(y);
    axis_z.add(z);
  }

  static double mean(List list) {
    if (list.length == 0) return 0.0;
    double sum = 0;
    for (int i = 0; i < list.length; i++) {
      sum += list[i];
    }
    return sum / list.length;
  }

  static double variance(List list) {
    if (list.length == 0) return 0.0;
    double sum = 0;
    double mean = CollectionAxis.mean(list);
    for (int i = 0; i < list.length; i++) {
      sum += pow(list[i] - mean, 2);
    }
    return sum / list.length;
  }

  static double standardDeviation(List list) {
    return sqrt(CollectionAxis.variance(list));
  }

  static double max(List list) {
    if (list.length == 0) return 0.0;
    double max = list[0];
    for (int i = 0; i < list.length; i++) {
      if (list[i] > max) {
        max = list[i];
      }
    }
    return max;
  }

  static double min(List list) {
    if (list.length == 0) return 0.0;
    double min = list[0];
    for (int i = 0; i < list.length; i++) {
      if (list[i] < min) {
        min = list[i];
      }
    }
    return min;
  }

  void reset() {
    axis_x = [];
    axis_y = [];
    axis_z = [];
  }

  List<Map<String, dynamic>> toJson() {
    return [
      {'axis_x': axis_x},
      {'axis_y': axis_y},
      {'axis_z': axis_z},
    ];
  }
}
