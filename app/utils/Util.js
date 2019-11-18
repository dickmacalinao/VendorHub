import { Alert } from 'react-native';

export const clean = (str) => {
    //newStr = str.replaceAll("/","");
    //newStr = newStr.replaceAll("\\","");
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const toUpperCase = (str) => {
    return str.toUpperCase();
}

export const currencyFormat = (num) => {
    return 'P' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, 'P1,');
}

export const ConfirmationAlert = (label, message, onPress) => {
    Alert.alert(
        label,
        message,
        [
            {
                text: 'No',
                onPress: () => {},
                style: 'cancel',
            },
            {
                text: 'Yes',
                onPress: onPress,
            },
        ],
        {cancelable: false},
    )
}