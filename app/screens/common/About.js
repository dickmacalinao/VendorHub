import React, { Component } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

import { APP_VERSION_NAME, APP_VERSION_NO } from '../../config/constant';
import { flatListSeparator } from "../../components/ListCommonComponent";

import ListStyle from '../../styles/styles-list';

class About extends Component {

    // Start Components triggers
    constructor(props) {
        super(props);
        this.info = [
            {id: '1', title: 'Application Name', subTitle: APP_VERSION_NAME},
            {id: '2', title: 'Application Version', subTitle: APP_VERSION_NO},
        ];
    }
    // End Components triggers

    render() {
        return (
            <View style={ListStyle.parentContainer}>
                <FlatList
                    data={this.info}
                    keyExtractor={(item, index) => item + index}
                    ItemSeparatorComponent={flatListSeparator}
                    renderItem={({ item, index }) => (
                        <View style={{ flex: 1, flexDirection: 'column', marginLeft: 0}}>
                            <Text style={ListStyle.listTextBold}>{item.title}</Text>
                            <Text style={ListStyle.listText}>{item.subTitle}</Text>
                        </View>
                    )}
                />
            </View>
        );
    }
}

export default About;

const styles = StyleSheet.create({
});
