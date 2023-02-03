from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn import metrics
import matplotlib.pyplot as plt
from sklearn.model_selection import GridSearchCV
from DataPreprocessing import preprocessing as pp

#Best leaf_size: 1
#Best p: 2
#Best n_neighbors: 14

X, y = pp()

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
'''
k_range = range(5, 60)
scores = {}
scores_list = []
max = 0
index = 0

#Il valore k nell'algoritmo k-NN definisce quanti vicini verranno controllati per determinare la classificazione di un punto di query specifico
#Ad esempio, se k=1, l'istanza verrà assegnata alla stessa classe del suo singolo neighbors più vicino.
for k in k_range:
    knn = KNeighborsClassifier(n_neighbors = k)
    knn.fit(X_train, y_train)
    y_pred = knn.predict(X_test)
    accuracy = metrics.accuracy_score(y_test, y_pred)
    if(accuracy > max):
      max = accuracy
      index = k
    scores[k] = accuracy
    scores_list.append(accuracy)

print(max)
print(index)
plt.plot(k_range, scores_list)
plt.xlabel('Value of K for KNN')
plt.ylabel('Testing Accuracy')
plt.show()
'''

#List Hyperparameters that we want to tune.
weights = ['uniform', 'distance']
leaf_size = list(range(1,50))
n_neighbors = list(range(1,50))
p=[1,2]
#Convert to dictionary
hyperparameters = dict(weights=weights, leaf_size=leaf_size, n_neighbors=n_neighbors, p=p)
#Create new KNN object
knn_2 = KNeighborsClassifier()
#Use GridSearch
clf = GridSearchCV(knn_2, hyperparameters, cv=10)
#Fit the model
best_model = clf.fit(X,y)
#Print The value of best Hyperparameters
print('Best leaf_size:', best_model.best_estimator_.get_params()['leaf_size'])
print('Best p:', best_model.best_estimator_.get_params()['p'])
print('Best n_neighbors:', best_model.best_estimator_.get_params()['n_neighbors'])