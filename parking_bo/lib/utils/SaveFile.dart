import 'dart:io';
import 'package:path_provider/path_provider.dart';

abstract class SaveFile {
  static writeToFile(String text) async {
    final file = await _localFile;
    file.writeAsString(text);
    print("file saved");
  }

  static Future<File> get _localFile async {
    final path = await _localPath;
    DateTime now = DateTime.now();
    return File('$path/SensorData$now.txt');
  }

  static Future<String> get _localPath async {
    final directory = await getApplicationDocumentsDirectory(); //getExternalStorageDirectory();
    print(directory.path);
    return directory.path;
  }
}
