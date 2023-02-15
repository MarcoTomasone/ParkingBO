import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.model_selection import RandomizedSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import GaussianNB
import numpy as np
from imblearn.under_sampling import RandomUnderSampler

df= pd.read_csv("./supports/har_dataset_preprocessedUnscaledWithStill.csv")
rd = pd.read_csv("./supports/real_data.csv")


df = df.reindex(columns=['android.sensor.accelerometer#mean','android.sensor.accelerometer#max','android.sensor.accelerometer#min','android.sensor.accelerometer#std','android.sensor.gyroscope#mean','android.sensor.gyroscope#max','android.sensor.gyroscope#min','android.sensor.gyroscope#std','android.sensor.gyroscope_uncalibrated#mean','android.sensor.gyroscope_uncalibrated#max','android.sensor.gyroscope_uncalibrated#min','android.sensor.gyroscope_uncalibrated#std','target'])

df.reset_index()
y = df["target"] 
X = df.drop(columns="target")
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42, test_size=0.1, shuffle=True)

yr = rd['target']
Xr = rd.drop(['target'],axis=1)
X_trainR, X_testR,y_trainR, y_testR = train_test_split(Xr, yr, test_size=0.1,random_state=42,shuffle=True)

X_train = pd.concat([X_trainR,X_train])
y_train = pd.concat([y_trainR,y_train])

df = pd.concat([X_train,y_train],axis=1)
rus = RandomUnderSampler(random_state=42)
X_train, y_train = rus.fit_resample(X_train, y_train)

# Number of trees in random forest
n_estimators = [int(x) for x in np.linspace(start = 200, stop = 2000, num = 10)]
# Number of features to consider at every split
# Maximum number of levels in tree
max_depth = [int(x) for x in np.linspace(10, 110, num = 11)]
max_depth.append(None)
max_features = [None,'sqrt', 'log2']
# Minimum number of samples required to split a node
min_samples_split = [2, 5, 10]
# Minimum number of samples required at each leaf node
min_samples_leaf = [1, 2, 4]
# Method of selecting samples for training each tree
bootstrap = [True, False]
# Create the random grid
grid = {'n_estimators': n_estimators,
                'max_features': max_features,
                'max_depth': max_depth,
                'min_samples_split': min_samples_split,
                'min_samples_leaf': min_samples_leaf,
                'bootstrap': bootstrap}
# Instantiate model with 1000 decision trees
# Use the random grid to search for best hyperparameters
# First create the base model to tune
rf = RandomForestClassifier()
# Random search of parameters, using 3 fold cross validation, 
# search across 100 different combinations, and use all available cores
rf_random = RandomizedSearchCV(estimator = rf,param_distributions=grid, cv = 5, verbose=10, n_jobs = -1,random_state=42, n_iter = 100)
# Fit the random search model
rf_random.fit(X_train, y_train)

print(rf_random.best_params_)