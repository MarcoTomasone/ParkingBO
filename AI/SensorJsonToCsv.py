import json
import pandas as pd
#importa il JSon preso dal dispositivo mobile e salva un Dataframe CSV

def fromJSONtoCSV(name):
    f = open('./supports/'+name+'.json')
    data = json.load(f)
    f.close()

    data = pd.json_normalize(data)
    data.drop(['libTarget'],axis=1,inplace=True);
    data['userTarget'] = data['userTarget'].map({'userActivity.STILL': 2, 'userActivity.WALKING': 1, 'userActivity.DRIVING': 0})
    #data = data[(data['userTarget'] == 1) | (data['userTarget'] == 0)]

    data.to_csv('./supports/'+name+'.csv', index=False)
