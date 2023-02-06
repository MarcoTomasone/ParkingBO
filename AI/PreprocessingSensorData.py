import json
import pandas as pd

f = open('./supports/SensorData.json')
data = json.load(f)
f.close()



accelerometerList = pd.json_normalize(data,record_path=['accelerometerList']);
uAccList = pd.json_normalize(data,record_path=['uAccelerometerList']);
gyroscopeList = pd.json_normalize(data,record_path=['gyroscopeList']);
magnetometerList = pd.json_normalize(data,record_path=['magnetometerList']);
accelerometerList.rename(columns={'x':'accelerometer_x','y':'accelerometer_y','z':'accelerometer_z'},inplace=True)
uAccList.rename(columns={'x':'uAccelerometer_x','y':'uAccelerometer_y','z':'uAccelerometer_z'},inplace=True)
gyroscopeList.rename(columns={'x':'gyroscope_x','y':'gyroscope_y','z':'gyroscope_z'},inplace=True)
magnetometerList.rename(columns={'x':'magnetometer_x','y':'magnetometer_y','z':'magnetometer_z'},inplace=True)

data = pd.concat([accelerometerList,uAccList,gyroscopeList,magnetometerList],axis=1)
##Manca aggiungere TARGET (e ovviamente duplicare le tuple per avere un numero pari per ogni classe)
print(data)

