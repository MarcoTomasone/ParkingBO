import json
import pandas as pd
from itertools import repeat
from operator import itemgetter
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn import metrics
from sklite import LazyExport

fw = open('./supports/S_onlyWalking.csv')
f = open('./supports/S1.csv')
har = open('./supports/har_dataset_preprocessedUnscaled.csv')
#data = json.load(f)


data = pd.read_csv(f)
dataW = pd.read_csv(fw)
datahar = pd.read_csv(har)
f.close()
fw.close()
har.close()


data = data.append(datahar, ignore_index=True)
#data = pd.json_normalize(data)
#data.drop(['libTarget'],axis=1,inplace=True);
#data['userTarget'] = data['userTarget'].map({'userActivity.STILL': 2, 'userActivity.WALKING': 1, 'userActivity.DRIVING': 0})

#data.to_csv('./supports/S2.csv', index=False)
#y = data['target'] 
y = pd.DataFrame(1, index=range(len(data)), columns=['target'])	
x = data.drop(['target'],axis=1);
#print(y)
X_train, X_test, y_train, y_test = train_test_split(x, y, test_size=0.1, random_state=5)
rf = RandomForestClassifier(n_estimators=100, random_state=5)
rf.fit(X_train, y_train)
y_pred = rf.predict(X_test)
print('Accuracy:', metrics.accuracy_score(y_test, y_pred))
print('Precision:', metrics.confusion_matrix(y_test, y_pred))

print(dataW)

#for i in dataW.index:
#    for j in dataW.columns:
#        if j != 'target':
#            dataW.loc[i,j] =float(str(dataW.loc[i,j]).replace(',', ''))

y_w,x_w=dataW['target'], dataW.drop(['target'],axis=1)
y_pred_w = rf.predict(x_w)
print('Accuracy:', metrics.accuracy_score(y_w, y_pred_w))
print('Precision:', metrics.confusion_matrix(y_w, y_pred_w).ravel())

exp = LazyExport(rf)
exp.save('./supports/modelFake.json')
# function to insert a float value and convert to a string



