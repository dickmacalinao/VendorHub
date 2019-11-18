import React, { Component } from 'react';
import { TouchableOpacity, Text } from 'react-native';

import { onSignIn, onSignOut, isSignedIn } from "../../config/auth";

export default class extends Component {

    componentDidMount = () => {
        onSignOut()
            .then(res => { this.props.navigation.navigate('Login') });

    }

    render() {
        return (
            <TouchableOpacity style = {{ margin: 128 }} onPress={() => this.props.navigation.navigate('Login')} >
                <Text>Click here to Re-login</Text>
            </TouchableOpacity>
        );
    }

}
