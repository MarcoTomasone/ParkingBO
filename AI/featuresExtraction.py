import pandas as pd
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn import metrics
import matplotlib.pyplot as plt

df = pd.read_csv('./har_dataset.csv', sep=';', encoding='utf-8')
df = df[(df['target'] == 'Car') | (df['target'] == 'Walking')]
#0 = Car
#1 = Walinkg
for index, row in df.iterrows():
    row['target'] = 0 if(row['target'] == 'Car') else 1
    df.at[index, 'target'] = row['target']

X = df.drop(['target'], axis=1)
y = df['target']
y = y.astype('int')


for column in X:
  mean_value = X[column].mean()
  X[column].fillna(value=mean_value, inplace=True)

X = X.dropna()
y = y.dropna()


X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
k_range = range(1, 26)
scores = {}
scores_list = []

#Il valore k nell'algoritmo k-NN definisce quanti vicini verranno controllati per determinare la classificazione di un punto di query specifico
#Ad esempio, se k=1, l'istanza verrà assegnata alla stessa classe del suo singolo neighbors più vicino.
for k in k_range:
    print(str(k))
    knn = KNeighborsClassifier(n_neighbors = k)
    knn.fit(X_train, y_train)
    y_pred = knn.predict(X_test)
    scores[k] = metrics.accuracy_score(y_test, y_pred)
    scores_list.append(metrics.accuracy_score(y_test, y_pred))

print(scores)
plt.plot(k_range, scores_list)
plt.ylabel('Testing Accuracy')
plt.xlabel('Value of K for KNN')