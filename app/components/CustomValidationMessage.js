import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';

const CustomValidationMessage = (props) => {
    return (
        <View style={styles.container}>
            {props.message.map((msg) => (
                <Text style = {[msg.type=='ERROR' ? styles.error : (msg.type=='WARNING' ? styles.warning : styles.info)]} key={msg.message} >{msg.message}</Text>
            ))}
        </View>
    )
}
export default CustomValidationMessage;

const styles = StyleSheet.create({
    container: {
        alignItems: "stretch",
        justifyContent: "center",
    },
    error: {
        backgroundColor: 'red',
        color: 'white',
        paddingLeft: 10,
        padding: 4,
        alignItems: 'stretch',
    },
    warning: {
        backgroundColor: 'coral',
        color: 'white',
        paddingLeft: 10,
        padding: 4,
    },
    info: {
        backgroundColor: 'green',
        color: 'white',
        paddingLeft: 10,
        padding: 4,
    },
});