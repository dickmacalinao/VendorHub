import React from 'react';
import { View, Text } from 'react-native';

import Colors from '../components/Colors';
import ListStyle from '../styles/styles-list';

export const flatListHeader = () => {

    var header_View = (
		<View style={ListStyle.header_footer_style}>
		  <Text style={ListStyle.header_textStyle}>Order Items</Text>
		</View>
    );
    return header_View ;

};

export const listEmpty = (message) => {
    return (
		//View to show when list is empty
		<View>
			<Text style={{ textAlign: 'left' }}>{message}</Text>
		</View>
    );
};

export const flatListSeparator = () => {
    return (
        <View
            style={{
                height: 1,
                backgroundColor: Colors.darkgray,
            }}
        />
    );
};