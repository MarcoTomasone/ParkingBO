import json
import pandas as pd

from itertools import repeat
from operator import itemgetter

f = open('./supports/sensorJson.json')
data = json.load(f)
f.close()

data = pd.json_normalize(data)
print(data)


