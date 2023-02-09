from sklearn.cluster import DBSCAN
from sklearn.model_selection import GridSearchCV
import numpy as np
import json

def delete_null(dict):
    zero_index = 0
    one_index = 0
    for key in list(dict.keys()):
        all_are_zero = all( x == 0 for x in dict[key])
        all_are_one = all( x == 1 for x in dict[key])
        if all_are_zero:
            zero_index = key
            del dict[key]
        if all_are_one:
            if one_index == 0: one_index = key
            del dict[key]
    print("zero_index: ", zero_index)
    print("one_index: ", one_index)
    return dict

vectors = json.loads(open('./vectors.json').read())

#List Hyperparameters that we want to tune.
epsilon_range = list(np.arange (0.0001, 0.1, 0.0001))
data = {key: [] for key in epsilon_range}
minimumSamples = list(range(2, 30))

stop = 5

for key in data:
    for value in minimumSamples:
        db = DBSCAN(eps=float(key), min_samples=value).fit(vectors)
        labels = db.labels_
        n_clustears = len(set(labels)) - (1 if -1 in labels else 0)
        data[key].append(n_clustears)
    

data = delete_null(data)
print(data)
print(len(data))

