import json
import pandas as pd

name = 'S_onlyWalking'
f = open('./supports/'+name+'.json')
data = json.load(f)

f.close()


data = pd.json_normalize(data)
data.drop(['libTarget'],axis=1,inplace=True);
data['userTarget'] = data['userTarget'].map({'userActivity.STILL': 2, 'userActivity.WALKING': 1, 'userActivity.DRIVING': 0})
data = data[(data['userTarget'] == 1) | (data['userTarget'] == 0)]

#Copy this row in csv file
#android.sensor.accelerometer#mean,android.sensor.accelerometer#min,android.sensor.accelerometer#max,android.sensor.accelerometer#std,android.sensor.gyroscope#mean,android.sensor.gyroscope#min,android.sensor.gyroscope#max,android.sensor.gyroscope#std,android.sensor.gyroscope_uncalibrated#mean,android.sensor.gyroscope_uncalibrated#min,android.sensor.gyroscope_uncalibrated#max,android.sensor.gyroscope_uncalibrated#std,target

data.to_csv('./supports/'+name+'.csv', index=False)
