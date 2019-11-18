import { StyleSheet  } from 'react-native';
import Colors from '../components/Colors';

export default StyleSheet.create({
    mainContainer: {
        flex: 1,
        //display: flex,
        //height: 100%,
        flexDirection: 'column',
        alignItems: 'stretch',
        margin: 5,
    },
    parentContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    textInput: {
        flex: 1,
        paddingHorizontal: 10,
        backgroundColor: Colors.white,
    },
    textInputStrikeThrough: {
        textDecorationLine: "line-through",
        textDecorationStyle: "solid",
    },
    textFieldInput: {
        backgroundColor: Colors.white,
    },
    textInputLabel: {
        color: Colors.white,
    },
    buttonContainer: {
        //flex: 1,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "center",
        //borderWidth: 1,
    },
    buttonView: {
        margin: 5,
        flexShrink: 0,
    },
    buttonPrimary: {
        backgroundColor: Colors.purple,
        paddingVertical: 15,
        marginVertical: 15,
        alignItems: "center",
        justifyContent: "center",
        //borderWidth: 1,
    },
    button: {
        backgroundColor: Colors.dimgrey,
        paddingVertical: 15,
        marginVertical: 15,
        alignItems: "center",
        justifyContent: "center",
        //borderWidth: 1,
    },
    buttonText: {
        color: "#FFF",
        fontSize: 16
    },
    AddButton: {
        position: 'absolute',
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        right: 10,
        bottom: 10,
    },
    AddImageButtonStyle: {
        resizeMode: 'contain',
        width: 40,
        height: 40,
        //backgroundColor:'black'
    },
    FloatingButtonStyle: {
        resizeMode: 'contain',
        width: 40,
        height: 40,
        //backgroundColor:'black'
    },
    activityIndicator: {
        //flex: 1,
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    modelMenuContainer: {
        flex: 1,
        flexDirection: 'row',
        paddingTop: 10,
        alignSelf: 'flex-end',
    },
    textDisplay: {
        color: Colors.darkslategrey,
        padding: 5,
        fontSize: 14,
        fontFamily: 'Courier',
    }
});