import json
import pandas as pd
from itertools import repeat
from operator import itemgetter
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn import metrics
from sklearn.metrics import confusion_matrix,ConfusionMatrixDisplay
from sklite import LazyExport
from sklearn.utils import resample
import matplotlib.pyplot as plt
from imblearn.under_sampling import RandomUnderSampler


real_dataDF = pd.read_csv('./supports/real_data.csv')

har_dataDF =pd.read_csv('./supports/har_dataset_preprocessedUnscaledWithStill.csv')

#  Creiamo un modello addestrato sia con i dati reali che con quelli di HAR 
# e poi lo testiamo per vedere se riesce a riconoscere i movimenti reali 
#divide both inputs in train and test sets
har_dataDF = har_dataDF.reindex(columns=['android.sensor.accelerometer#mean','android.sensor.accelerometer#max','android.sensor.accelerometer#min','android.sensor.accelerometer#std','android.sensor.gyroscope#mean','android.sensor.gyroscope#max','android.sensor.gyroscope#min','android.sensor.gyroscope#std','android.sensor.gyroscope_uncalibrated#mean','android.sensor.gyroscope_uncalibrated#max','android.sensor.gyroscope_uncalibrated#min','android.sensor.gyroscope_uncalibrated#std','target'])
har_dataDFTrain, har_dataDFTest = train_test_split(har_dataDF, test_size=0.1, random_state=42, shuffle=True)
real_dataDFTrain, real_dataDFTest = train_test_split(real_dataDF, test_size=0.1,random_state=42,shuffle=True)
#create the full training set and shuffle it
dataset = pd.concat([har_dataDFTrain, real_dataDFTrain])
dataset = shuffle(dataset, random_state=42)

data = data.reindex(columns=['android.sensor.accelerometer#mean','android.sensor.accelerometer#max','android.sensor.accelerometer#min','android.sensor.accelerometer#std','android.sensor.gyroscope#mean','android.sensor.gyroscope#max','android.sensor.gyroscope#min','android.sensor.gyroscope#std','android.sensor.gyroscope_uncalibrated#mean','android.sensor.gyroscope_uncalibrated#max','android.sensor.gyroscope_uncalibrated#min','android.sensor.gyroscope_uncalibrated#std','target'])
y = data['target']
x = data.drop(['target'],axis=1)

yr = realdata['target']
xr = realdata.drop(['target'],axis=1)
X_trainR, X_testR,y_trainR, y_testR = train_test_split(xr, yr, test_size=0.1,random_state=42,shuffle=True)

X_train, X_test, y_train, y_test = train_test_split(x, y, test_size=0.1,random_state=42,shuffle=True)
rf = RandomForestClassifier(bootstrap=False, max_depth=None, max_features='log2', min_samples_leaf=1, min_samples_split=2, n_estimators=1600)
X_train = pd.concat([X_trainR,X_train])
y_train = pd.concat([y_trainR,y_train])

rus = RandomUnderSampler(random_state=42)
X_train, y_train = rus.fit_resample(X_train, y_train)

#y_train,X_train  = df['target'],df.drop(['target'],axis=1)

print(y_train.value_counts())
print(y_test.value_counts())


rf.fit(X_train, y_train)
y_pred = rf.predict(X_test)
print("Testing su HAR dataset")
print('Accuracy :', metrics.accuracy_score(y_test, y_pred))
print('Precision:', metrics.confusion_matrix(y_test, y_pred))
print(metrics.classification_report(y_test, y_pred))
cf = metrics.confusion_matrix(y_test, y_pred,labels=rf.classes_)
disp = ConfusionMatrixDisplay(confusion_matrix = cf,display_labels=rf.classes_)
disp.plot()
plt.show()

y_predR = rf.predict(X_testR)
print("Testing su dati reali")
print('Accuracy:', metrics.accuracy_score(y_testR, y_predR))
print('Precision:', metrics.confusion_matrix(y_testR, y_predR))
print(metrics.classification_report(y_testR, y_predR))
cf = metrics.confusion_matrix(y_testR, y_predR,labels=rf.classes_)
disp = ConfusionMatrixDisplay(confusion_matrix = cf,display_labels=rf.classes_)
disp.plot()
plt.show()

exp = LazyExport(rf)
exp.save('./supports/model.json')



