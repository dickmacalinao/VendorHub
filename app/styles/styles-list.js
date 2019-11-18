import { StyleSheet  } from 'react-native';
import Colors from '../components/Colors';

export default StyleSheet.create({
    parentContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        margin: 5,
    },
    header_footer_style: {
        width: '100%',
        height: 44,
        backgroundColor: Colors.royalblue,
        //alignItems: 'center',
        justifyContent: 'center',
    },
    header_textStyle:{
        textAlign: 'center',
        color: '#fff',
        fontSize: 21,
    },
    listText: {
        color: Colors.darkslategrey,
        padding: 5,
        fontSize: 14,
        fontFamily: 'Courier',
    },
    listTextBold: {
        color: Colors.darkslategrey,
        padding: 5,
        fontSize: 14,
        fontFamily: 'Courier',
        fontWeight: 'bold',
    },
    flatlist_header_group: {
        //flex: 1,
        flexDirection: 'row',
        //flexGrow: 1,
        //width: '100%',
    },
    flatlist_header_text: {
        fontSize: 16,
        alignSelf: 'center',
        color: '#fff',
        backgroundColor: Colors.royalblue,
        padding: 5,
    },
    flatlist_footer_group: {
        flexDirection: 'row',
        flexGrow: 1,
    },
    flatlist_footer_text: {
        fontSize: 16,
        fontWeight: 'bold',
        alignSelf: 'center',
        color: '#fff',
        backgroundColor: Colors.darkslategrey,
        padding: 5,
    },
    flatlist_content_group: {
        flexDirection: 'row',
        //flexGrow: 1,
        backgroundColor: Colors.white,
        //padding: 1,
    },
    flatlist_content_text: {
        alignSelf: 'center',
        padding: 5,
        color: Colors.black,
    },
    align_right: {
        textAlign: 'right',
    },
});