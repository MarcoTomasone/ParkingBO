import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.model_selection import RandomizedSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn import metrics
from sklearn.metrics import r2_score

df = pd.read_csv("./supports/har_dataset_preprocessedUnscaled.csv")
#df = pd.read_csv("./supports/har_dataset_preprocessedSacaled.csv")

df.reset_index()
y = df["target"] 
X = df.drop(columns="target")
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42, test_size=0.20, shuffle=True)

print(y_train.value_counts())
print(y_test.value_counts())

# Number of trees in random forest
n_estimators = [int(x) for x in np.linspace(start = 200, stop = 2000, num = 10)]
# Number of features to consider at every split
max_features = ['auto', 'sqrt']
# Maximum number of levels in tree
max_depth = [int(x) for x in np.linspace(10, 110, num = 11)]
max_depth.append(None)
# Minimum number of samples required to split a node
min_samples_split = [2, 5, 10]
# Minimum number of samples required at each leaf node
min_samples_leaf = [1, 2, 4]
# Method of selecting samples for training each tree
bootstrap = [True, False]
# Create the random grid
random_grid = {'n_estimators': n_estimators,
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
rf_random = RandomizedSearchCV(estimator = rf, param_distributions = random_grid, n_iter = 100, cv = 3, verbose=10, random_state=42, n_jobs = -1)
# Fit the random search model
rf_random.fit(X_train, y_train)
print(rf_random.best_params_)

predictions = rf.predict(X_test)

from pprint import pprint
# arr is the numpy ndarray
#pprint(predictions.tolist())
print(predictions)

print(r2_score(y_test, predictions))
print("Evaluating the Algorithm:\n")
print(metrics.confusion_matrix(y_test, predictions))
print(metrics.classification_report(y_test, predictions))


print("Evaluating Prediction Accuracy:\n")
print("Accuracy:", metrics.accuracy_score(y_test, predictions))
cf = metrics.confusion_matrix(y_test,  predictions ,labels=rf2.classes_)
disp = metrics.ConfusionMatrixDisplay(confusion_matrix = cf,display_labels=["Driving", "Walking"])
disp.plot()
plt.show()