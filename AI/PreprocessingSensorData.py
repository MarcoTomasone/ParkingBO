import json
import pandas as pd
from itertools import repeat
from operator import itemgetter
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn import metrics
from sklite import LazyExport
from sklearn.preprocessing import MinMaxScaler

f = open('./supports/har_dataset_preprocessedScaled.csv')
#data = json.load(f)


data = pd.read_csv(f)
f.close()

#data = pd.json_normalize(data)
#data.drop(['libTarget'],axis=1,inplace=True);
#data['userTarget'] = data['userTarget'].map({'userActivity.STILL': 2, 'userActivity.WALKING': 1, 'userActivity.DRIVING': 0})

#data.to_csv('./supports/S2.csv', index=False)
y = data['target'] 
x = data.drop(['target'],axis=1);

#print(x)
#print(y)

X_train, X_test, y_train, y_test = train_test_split(x, y, test_size=0.1, random_state=50)
rf = RandomForestClassifier(n_estimators=1800,min_samples_split= 2, min_samples_leaf=4, max_depth=50, bootstrap=False )
rf.fit(X_train, y_train)
y_pred = rf.predict(X_test)
print('Accuracy:', metrics.accuracy_score(y_test, y_pred))

f = open('./supports/S1.csv')
dataSensor = pd.read_csv(f)
f.close()

scaler = MinMaxScaler() # Create a MinMaxScaler object

df_scaled = scaler.fit_transform(dataSensor.to_numpy())
df = pd.DataFrame(df_scaled, columns=dataSensor.columns)

y_s = df['target']
X_s = df.drop(['target'],axis=1);


y_pred_s = rf.predict(X_s)
print('Accuracy:', metrics.accuracy_score(y_s, y_pred_s))
print('Accuracy:', metrics.confusion_matrix(y_s, y_pred_s).ravel())


