import json
import pandas as pd
from itertools import repeat
from operator import itemgetter
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn import metrics
from sklite import LazyExport

#  Creiamo un modello addestrato con i nostri dati reali e lo testiamo con
# algoritmo Random Forest

f = open('./supports/real_data.csv')
data = pd.read_csv(f)
f.close()
print(len(data))
data.rename({'userTarget': 'target'}, axis=1, inplace=True)
data = data[(data['target'] == 1) | (data['target'] == 0)]
y = data['target']
x = data.drop(['target'],axis=1);

X_train, X_test, y_train, y_test = train_test_split(x, y, test_size=0.1, random_state=5)
rf = RandomForestClassifier(n_estimators=100, random_state=5)
rf.fit(X_train, y_train)

y_pred = rf.predict(X_test)
print('Accuracy:', metrics.accuracy_score(y_test, y_pred))
print(metrics.confusion_matrix(y_test, y_pred))