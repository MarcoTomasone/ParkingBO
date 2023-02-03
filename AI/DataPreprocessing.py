import pandas as pd

def preprocessing():
    df = pd.read_csv('./supports/har_dataset.csv', sep=';', encoding='utf-8')
    df = df[(df['target'] == 'Car') | (df['target'] == 'Walking')]
    #0 = Car & 1 = Walinkg
    for index, row in df.iterrows():
        row['target'] = 0 if(row['target'] == 'Car') else 1
        df.at[index, 'target'] = row['target']

    X = df.drop(['target'], axis=1)
    y = df['target']
    y=y.astype('int')

    for column in X:
        mean_value = X[column].mean()
        X[column].fillna(value=mean_value, inplace=True)

    X = X.dropna()
    y = y.dropna()

    return X,y

