import json
import pandas as pd
from itertools import repeat
from operator import itemgetter
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn import metrics
from sklearn.metrics import confusion_matrix,ConfusionMatrixDisplay
import matplotlib.pyplot as plt
from sklearn.utils import shuffle


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

y = dataset['target'] 
x = dataset.drop(['target'],axis=1) 
X_train, X_test, y_train, y_test = train_test_split(x, y, test_size=0.1,random_state=42,shuffle=True)

rf = RandomForestClassifier(n_estimators=300)
rf.fit(X_train, y_train)

y_pred = rf.predict(X_test)

print('Accuracy:', metrics.accuracy_score(y_test, y_pred))
print('Precision:', metrics.confusion_matrix(y_test, y_pred))

#Once fitted model, prepare two test set for real and har data

y_har_test = har_dataDFTest['target'] 
x_har_test = har_dataDFTest.drop(['target'],axis=1)


y_real_test = real_dataDFTest['target']
x_real_test = real_dataDFTest.drop(['target'],axis=1)
y_predp = rf.predict(x_har_test)

print('AccuracyProf:', metrics.accuracy_score(y_har_test, y_predp))
print('Precision:', metrics.confusion_matrix(y_har_test, y_predp))


y_predR = rf.predict(x_real_test)
print('Accuracy Real:', metrics.accuracy_score(y_real_test, y_predR))
print('Precision:', metrics.confusion_matrix(y_real_test, y_predR))
cf = metrics.confusion_matrix(y_real_test, y_predR,labels=rf.classes_)
disp = ConfusionMatrixDisplay(confusion_matrix = cf,display_labels=rf.classes_)
disp.plot()
plt.show()

#exp = LazyExport(rf)
#exp.save('./supports/model.json')



