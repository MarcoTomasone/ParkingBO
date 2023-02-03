from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn import metrics
import matplotlib.pyplot as plt
from DataPreprocessing import preprocessing as pp

X,y = pp()

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

max_depth_range = range(1, 20)
depth = []
accuracy = []

for i in max_depth_range:
    clf = RandomForestClassifier(n_estimators=100,max_depth=i, random_state=42)
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_test)
    accuracy.append(metrics.accuracy_score(y_test, y_pred))
    depth.append(i)
 
plt.plot(depth, accuracy)
plt.xlabel('Value of depth for Random Forest')
plt.ylabel('Testing Accuracy')
plt.show()