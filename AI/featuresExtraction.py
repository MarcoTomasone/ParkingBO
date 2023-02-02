import pandas as pd
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn import metrics
import matplotlib.pyplot as plt

df = pd.read_csv('./har_dataset.csv', sep=';', encoding='utf-8')
df = df[(df['target'] == 'Car') | (df['target'] == 'Walking')]
for index, row in df.iterrows():
    row['target'] = 0 if(row['target'] == 'Car') else 1
    df.at[index, 'target'] = row['target']

X = df.drop(['target'], axis=1)
y = df['target']
y=y.astype('int')

#0 = Car
#1 = walinkg

for column in X:
  mean_value = X[column].mean()
  X[column].fillna(value=mean_value, inplace=True)

X = X.dropna()
y = y.dropna()


for column in X:
  mean_value = X[column].mean()
  X[column].fillna(value=mean_value, inplace=True)

X = X.dropna()
y = y.dropna()


X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
k_range = range(5, 60)
scores = {}
scores_list = []
max = 0
index = 0

#Il valore k nell'algoritmo k-NN definisce quanti vicini verranno controllati per determinare la classificazione di un punto di query specifico
#Ad esempio, se k=1, l'istanza verrà assegnata alla stessa classe del suo singolo neighbors più vicino.
for k in k_range:
    print(k)
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


'''
#RANDOM FOREST
from sklearn.ensemble import RandomForestClassifier
# creating a RF classifier
clf = RandomForestClassifier(n_estimators = 100)  
  
# Training the model on the training dataset
# fit function is used to train the model using the training sets as parameters
clf.fit(X_train, y_train)
  
# performing predictions on the test dataset
y_pred = clf.predict(X_test)
  
# metrics are used to find accuracy or error
from sklearn import metrics  
print()
  
# using metrics module for accuracy calculation
print("ACCURACY OF THE MODEL: ", metrics.accuracy_score(y_test, y_pred))
'''