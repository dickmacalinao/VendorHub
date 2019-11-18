import React, { Component } from 'react';
import { View,
    Text,
    TouchableOpacity,
    } from 'react-native';
import { TextField } from 'react-native-material-textfield';
import { Dropdown } from 'react-native-material-dropdown';
import NumericInput from 'react-native-numeric-input'
import CommonStyle from '../styles/styles';

export class DynamicTextField extends Component {

    render() {
        alert(this.props.label);
        if ( this.props.visible ) {
			if ( this.props.secure ) {
				return(
					<TextField
						label={this.props.label}
						value={this.props.value}
						secureTextEntry
						onChangeText={this.props.onChangeText}
					/>
				)
			} else {
				return(
					<TextField
						label={this.props.label}
						value={this.props.value}
						onChangeText={this.props.onChangeText}
					/>
				)
			}

        } else {
            return null;
        }

    }

}

export class DynamicDropDown extends Component {

	render() {
        if ( this.props.visible ) {
            return(
                <Dropdown
                    label={this.props.label}
                    data={this.props.data}
                    value={this.props.value}
                    containerStyle={this.props.containerStyle}
                    onChangeText={this.props.onChangeText}
                />
            )
        } else {
            return null;
		}

	}
}

export class CustomButton extends Component {

    render() {
        if ( this.props.visible ) {
            return (
                <View style={[CommonStyle.buttonView, {width: (this.props.width ? this.props.width : 100)}]}>
                    <TouchableOpacity activeOpacity={.5} onPress={this.props.onPress}>
                        <View style={this.props.primary ? CommonStyle.buttonPrimary : CommonStyle.button}>
                            <Text style={CommonStyle.buttonText}>{this.props.label}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )
        } else {
            return null;
        }

    }

}

export class NumericField extends Component {

    render() {
        if ( this.props.visible ) {
            return (
                <View>
                    <Text>{this.props.label}</Text>
                    <NumericInput
                        value={this.props.value}
                        onChange={this.props.onChange}
                        onLimitReached={(isMax,msg) => console.log(isMax,msg)}
                        totalWidth={150}
                        totalHeight={35}
                        iconSize={10}
                        step={1}
                        valueType='real'
                        rounded
                        textColor='#B0228C'
                        iconStyle={{ color: 'white' }}
                        rightButtonBackgroundColor='#EA3788'
                        leftButtonBackgroundColor='#E56B70'
                    />
                </View>
            );
        } else {
           return null;
        }
    }
}