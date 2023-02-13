import pandas as pd
from sklearn.preprocessing import MinMaxScaler

dataset = pd.read_csv('./supports/har_dataset.csv', sep=';', encoding='utf-8', index_col=False) # Read the dataset using ; as separator and utf-8 encoding
dataset = dataset[(dataset['target'] == 'Car') | (dataset['target'] == 'Walking') | (dataset['target']=='Still')] # Filter the dataset to keep only Car and Walking
dataset['target'] = dataset['target'].map({'Car': 0, 'Walking': 1, 'Still':2}) # Map the target values to 0 and 1

print(dataset.shape)
# Drop all the rows with missing values
dataset.dropna(thresh=2, subset=["android.sensor.gyroscope#mean", "android.sensor.gyroscope#min", "android.sensor.gyroscope#max","android.sensor.gyroscope#std"], inplace=True) 
dataset.dropna(thresh=2, subset=["android.sensor.gyroscope_uncalibrated#mean", "android.sensor.gyroscope_uncalibrated#min", "android.sensor.gyroscope_uncalibrated#max","android.sensor.gyroscope_uncalibrated#std"], inplace=True)
print(dataset.shape) #Losing 5500 rows

# https://stackoverflow.com/questions/18689823/pandas-dataframe-replace-nan-values-with-average-of-columns
for i in dataset.columns[dataset.isnull().any(axis=0)]:     #Applying Only on variables with NaN values
    dataset[i].fillna(dataset[i].mean(),inplace=True)

dataset.to_csv('./supports/har_dataset_preprocessedUnscaledWithStill.csv', sep=',', encoding='utf-8', index=False) # Save the filtered dataset
dataset.to_excel('./supports/har_dataset_preprocessedUnscaledWithStill.xlsx') # Save the filtered dataset

scaler = MinMaxScaler() # Create a MinMaxScaler object

df_scaled = scaler.fit_transform(dataset.to_numpy())
df = pd.DataFrame(df_scaled, columns=dataset.columns)
#df.to_csv('./supports/har_dataset_preprocessedScaled.csv', sep=',', encoding='utf-8', index=False) # Save the filtered dataset
#df.to_excel('./supports/har_dataset_preprocessedScaled.xlsx') # Save the filtered dataset
