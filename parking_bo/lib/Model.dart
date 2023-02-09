import 'package:flutter/cupertino.dart';
import 'package:sklite/SVM/SVM.dart';
import 'package:sklite/ensemble/forest.dart';
import 'package:sklite/utils/io.dart';
import 'dart:convert';
import 'package:flutter/services.dart' show rootBundle;
import 'dart:io';
import 'package:flutter/material.dart';
import 'dart:developer' as dev;
class Model {
  RandomForestClassifier? model;

  void loadModel() async {
    await rootBundle.loadString("assets/model.json").then((value) {
      this.model = RandomForestClassifier.fromMap(json.decode(value));
    });
  }

  predict(List<double> data) {
    return this.model!.predict(data);
  }
}
