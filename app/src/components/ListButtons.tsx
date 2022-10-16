import React from 'react';
import { StyleSheet, Button, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

export type RootStackParamList = {
    Home: {};
    Map: {};
    Driving: {};
    Walking: {};
    Location: {};
    Transition: {};
};

const Separator = () => (
    <View style={styles.separator} />
  );



const ListButtons = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    return (
        <View style={styles.container}>
            <Button
                title="Mappa"
                color="yellow"
                onPress={() => navigation.navigate('Map', {})}
            />
            <Separator />
            <Button
                title="Riconoscere Driving"
                color="#f194ff"
                onPress={() => navigation.navigate('Driving', {})}
            />
            <Separator />
            <Button
                title="Riconoscere Walking"
                color="#80daeb"
                onPress={() => navigation.navigate('Walking', {})}
            />
            <Separator />
            <Button
                title="Riconoscere Location"
                color="#b2ec5d"
                onPress={() => navigation.navigate('Location', {})}
            />
            <Separator />
            <Button
                title="Riconoscere Transition"
                color="#ffc87c"
                onPress={() => navigation.navigate('Transition', {})}
            />
    </View>
      );
    }
    export default ListButtons;
    
    const styles = StyleSheet.create({
        container: {
          flex: 1,
          justifyContent: 'center',
          marginHorizontal: 16,
        },
        title: {
          textAlign: 'center',
          marginVertical: 8,
        },
        fixToText: {
          flexDirection: 'row',
          justifyContent: 'space-between',
        },
        separator: {
          marginVertical: 8,
          borderBottomColor: '#737373',
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
      });