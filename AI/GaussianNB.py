from sklearn.naive_bayes import GaussianNB
from sklearn.model_selection import train_test_split
from sklearn import metrics
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import mean_squared_error,r2_score,ConfusionMatrixDisplay
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

df = pd.read_csv("./har_dataset_preprocessedUnscaled.csv")
df.reset_index()
y = df["target"] 
X = df.drop(columns="target")
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42, test_size=0.20, shuffle=True)
param_grid_nb = { 'var_smoothing': np.logspace(0,-9, num=100) }
#Hyperparameter Tuning
gs_NB = GridSearchCV(estimator=GaussianNB(), param_grid=param_grid_nb, verbose=10, cv=10, n_jobs=-1)
models = gs_NB.fit(X_train, y_train)
print(models.best_params_)
print(models.best_estimator_)

#knn = models.best_estimator_
#knn = KNeighborsClassifier(n_neighbors=14, p=2, leaf_size=1, weights='distance')
#knn.fit(X_train, y_train)
#predictions = knn.predict(X_test)

gnb =  GaussianNB()
gnb.fit(X_train, y_train)
predictions = gnb.predict(X_test)

print(predictions)

print(r2_score(y_test, predictions))
print("Evaluating the Algorithm:\n")
print(metrics.confusion_matrix(y_test, predictions))
print(metrics.classification_report(y_test, predictions))


print("Evaluating Prediction Accuracy:\n")
print("Accuracy:", metrics.accuracy_score(y_test, predictions))
cf = metrics.confusion_matrix(y_test,  predictions ,labels=gnb.classes_)
disp = ConfusionMatrixDisplay(confusion_matrix = cf,display_labels=["Driving", "Walking"])
disp.plot()
plt.show()
