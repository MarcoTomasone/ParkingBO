from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn import metrics
import matplotlib.pyplot as plt
from DataPreprocessing import preprocessing as pp

X,y = pp();

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
k_range = range(5, 60)
scores = {}
scores_list = []
max = 0
index = 0

#Il valore k nell'algoritmo k-NN definisce quanti vicini verranno controllati per determinare la classificazione di un punto di query specifico
#Ad esempio, se k=1, l'istanza verrà assegnata alla stessa classe del suo singolo neighbors più vicino.
for k in k_range:
    knn = KNeighborsClassifier(n_neighbors = k, weights = 'distance')
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

