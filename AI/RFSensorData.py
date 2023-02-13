import json
import pandas as pd
from itertools import repeat
from operator import itemgetter
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn import metrics
from sklearn.metrics import confusion_matrix,ConfusionMatrixDisplay
from sklite import LazyExport
import matplotlib.pyplot as plt

realdata = pd.read_csv('./supports/real_data.csv')
data =pd.read_csv('./supports/har_dataset_preprocessedUnscaledWithStill.csv')

#  Creiamo un modello addestrato sia con i dati reali che con quelli di HAR 
# e poi lo testiamo per vedere se riesce a riconoscere i movimenti reali 

data = data.reindex(columns=['android.sensor.accelerometer#mean','android.sensor.accelerometer#max','android.sensor.accelerometer#min','android.sensor.accelerometer#std','android.sensor.gyroscope#mean','android.sensor.gyroscope#max','android.sensor.gyroscope#min','android.sensor.gyroscope#std','android.sensor.gyroscope_uncalibrated#mean','android.sensor.gyroscope_uncalibrated#max','android.sensor.gyroscope_uncalibrated#min','android.sensor.gyroscope_uncalibrated#std','target'])
y = data['target'] 
x = data.drop(['target'],axis=1);

yr = realdata['target']
xr = realdata.drop(['target'],axis=1)
X_trainR, X_testR,y_trainR, y_testR = train_test_split(xr, yr, test_size=0.1,random_state=42,shuffle=True)

X_train, X_test, y_train, y_test = train_test_split(x, y, test_size=0.1,random_state=42,shuffle=True)
rf = RandomForestClassifier(n_estimators=300)
X_train = pd.concat([X_trainR,X_train])
y_train = pd.concat([y_trainR,y_train])
rf.fit(X_train, y_train)

y_pred = rf.predict(X_test)

print('Accuracy:', metrics.accuracy_score(y_test, y_pred))
print('Precision:', metrics.confusion_matrix(y_test, y_pred))

y_predR = rf.predict(X_testR)
print('Accuracy:', metrics.accuracy_score(y_testR, y_predR))
print('Precision:', metrics.confusion_matrix(y_testR, y_predR))
cf = metrics.confusion_matrix(y_testR, y_predR,labels=rf.classes_)
disp = ConfusionMatrixDisplay(confusion_matrix = cf,display_labels=rf.classes_)
disp.plot()
plt.show()

#exp = LazyExport(rf)
#exp.save('./supports/model.json')



