import pandas as pd
import numpy as np

#measure the accuracy from libTarget and userTarget
def accuracy(df):
    df['accuracy'] = np.where(df['libTarget'] == df['target'], 1, 0)
    return df

df = pd.read_csv('./supports/real_data_libTarget.csv')
df = accuracy(df)
print(df['accuracy'].sum()/df['accuracy'].count())
#print("Valori Corretti"+df['accuracy'].value_counts())