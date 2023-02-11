import json
import pandas as pd
from itertools import repeat
from operator import itemgetter
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn import metrics
from sklite import LazyExport

fw = open('./supports/real_data.csv')
har = open('./supports/har_dataset_preprocessedUnscaled.csv')

#  Creiamo un modello addestrato con i dati del prof
#  e lo testiamo con i nostri dati reali

rd = pd.read_csv(fw)
datahar = pd.read_csv(har)

fw.close()
har.close()


data = datahar
y = data['target'] 
x = data.drop(['target'],axis=1);
X_train, X_test, y_train, y_test = train_test_split(x, y, test_size=0.1, random_state=5)
rf = RandomForestClassifier(n_estimators=1000,max_depth=50, min_samples_split=2, min_samples_leaf=1, bootstrap=False)
rf.fit(X_train, y_train)
y_pred = rf.predict(X_test)

print('Accuracy:', metrics.accuracy_score(y_test, y_pred))
print('Precision:', metrics.confusion_matrix(y_test, y_pred))


#for i in dataW.index:
#    for j in dataW.columns:
#        if j != 'target':
#            dataW.loc[i,j] =float(str(dataW.loc[i,j]).replace(',', ''))

#rd = rd[(rd['target']==1)| (rd['target']==0)]
#y_w  = rd['target']
#x_w  = rd.drop(['target'],axis=1)
#y_pred_w = rf.predict(x_w)
#print('Accuracy:', metrics.accuracy_score(y_w, y_pred_w))
#print('Precision:', metrics.confusion_matrix(y_w, y_pred_w).ravel())

exp = LazyExport(rf)
exp.save('./supports/model.json')



