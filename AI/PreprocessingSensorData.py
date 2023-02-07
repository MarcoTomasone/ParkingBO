import json
import pandas as pd

from itertools import repeat
from operator import itemgetter

f = open('./supports/SensorData1.json')
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
#target =data.get('target');

target = pd.json_normalize(data,record_path=['target']);


#print(accelerometerList.join(target.iloc(1),how='left')
df = pd.DataFrame(data = {'expected': [],'detected':[]})
for i in range(0,len(data)):
    targetElem = target['expected'][i]
    #print(targetElem)
    exp = tuple(repeat(targetElem, len(data[i].get('accelerometerList'))))
    dec = tuple(repeat(target['detected'][i], len(data[i].get('accelerometerList'))))
    df = df.append(pd.DataFrame(data = {'expected': exp,'detected':dec}),ignore_index=True)
    

    
df.reset_index(drop=True, inplace=True)
data = pd.concat([accelerometerList,uAccList,gyroscopeList,magnetometerList,df],axis=1)

#data.to_excel('./SensorData.xlsx',index=False)
print(data)

