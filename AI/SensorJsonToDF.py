import json
import pandas as pd
import numpy as np
import os

#importa il JSon preso dal dispositivo mobile e salva un Dataframe CSV

def fromJSONtoDF(name):
    f = open('../../SensorDataJson/'+name)
    data = json.load(f)
    f.close()

    data = pd.json_normalize(data)
    #data.drop(['libTarget'],axis=1,inplace=True);
    #data['libTarget'] = data['libTarget'].map({'ActivityType.STILL': 2, 'ActivityType.WALKING': 1, 'ActivityType.IN_VEHICLE': 0})
    #data['userTarget'] = data['userTarget'].map({'userActivity.STILL': 2, 'userActivity.WALKING': 1, 'userActivity.DRIVING': 0})
    #data.rename(columns={'userTarget': 'target'}, inplace=True)
    #data.reindex(columns=['android.sensor.accelerometer#mean','android.sensor.accelerometer#max','android.sensor.accelerometer#min','android.sensor.accelerometer#std','android.sensor.gyroscope#mean','android.sensor.gyroscope#max','android.sensor.gyroscope#min','android.sensor.gyroscope#std','android.sensor.gyroscope_uncalibrated#mean','android.sensor.gyroscope_uncalibrated#max','android.sensor.gyroscope_uncalibrated#min','android.sensor.gyroscope_uncalibrated#std','target'])
    #data = data[(data['userTarget'] == 1) | (data['userTarget'] == 0)]
    return data
    #data.to_csv('./supports/'+name+'.csv', index=False)

#df = pd.DataFrame()
#for elem in os.listdir('../../SensorDataJson'):
#  df = pd.concat([df, fromJSONtoDF(elem)])
#print(len(df))
#df.to_excel('../../SensorDataJson/merged.xlsx', index=False)

df = pd.read_excel('../../SensorDataJson/merged.xlsx')
dict = {}
keydict = {}
for row, value in df.iterrows():
    if(value['userTarget'] == value['libTarget']):
        if value['userTarget'] not in dict:
            dict[value['userTarget']] = 1
        else:
            dict[value['userTarget']] += 1
    if value['userTarget'] not in keydict:
        keydict[value['userTarget']] = 1
    else:
        keydict[value['userTarget']] += 1
print(dict)
print(keydict)


