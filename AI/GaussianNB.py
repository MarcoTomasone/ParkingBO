from sklearn.naive_bayes import GaussianNB
from sklearn.model_selection import train_test_split
from sklearn import metrics
import matplotlib.pyplot as plt
from DataPreprocessing import preprocessing as pp

X,y = pp();

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
GNB = GaussianNB()
GNB.fit(X_train, y_train)
y_pred = GNB.predict(X_test)
accuracy = metrics.accuracy_score(y_test, y_pred)
print(accuracy)
