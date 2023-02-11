import json
import pandas as pd
from itertools import repeat
from operator import itemgetter
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn import metrics
from sklite import LazyExport
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
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
y_pred_rf = rf.predict(X_test)

print('Random Forest')
print('Accuracy:', metrics.accuracy_score(y_test, y_pred_rf))
print(metrics.confusion_matrix(y_test, y_pred_rf))

knn = KNeighborsClassifier(n_neighbors=5)
knn.fit(X_train, y_train)
y_pred_knn = knn.predict(X_test)
print('KNN')
print('Accuracy:', metrics.accuracy_score(y_test, y_pred_knn))
print(metrics.confusion_matrix(y_test, y_pred_knn))

nb = GaussianNB()
nb.fit(X_train, y_train)
y_pred_nb = nb.predict(X_test)
print('Naive Bayes')
print('Accuracy:', metrics.accuracy_score(y_test, y_pred_nb))
print(metrics.confusion_matrix(y_test, y_pred_nb))


