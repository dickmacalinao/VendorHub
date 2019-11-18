import React, { Component } from 'react';
import {
    TouchableOpacity,
    Text,
    View,
    ScrollView,
    Dimensions,
    StyleSheet} from 'react-native';
import moment from 'moment';

import SalesLineChart from '../../components/SalesLineChart';
import { CustomButton } from '../../components/CommonComponent';

import CommonStyle from '../../styles/styles';
import Colors from '../../components/Colors';

export default class extends Component {

    // Start Components triggers
    constructor(props) {
        super(props);
        this.state = {
            filters: {
                chartDataContent: 'BySales',
                labelBy: 'Daily',
                dateFrom: moment(new Date()).subtract(7, 'days').format('YYYY-MM-DD'),
                dateTo: moment(new Date()).format('YYYY-MM-DD'),
                status_new: false,
                status_ordering: false,
                status_paid: true,
                status_cancelled: false,
                status_refund: false,
            },
        };
    }

    onLayout(e) {
        const {width, height} = Dimensions.get('window')
        console.log(width, height)
        this.setState({
            content_header_style: (height>width ? styles.content_header_portrait : styles.content_header_landscape),
        });
    }

    componentWillMount = () => {

        if (this.props.navigation.state.params) {
            this.setState({
                filters: this.props.navigation.state.params,
            });
        }

    }

    // End Components triggers

    showFilter = () => {
        this.props.navigation.navigate('ChartFilter', {...this.state.filters});
        //alert(JSON.stringify(this.state));
    }

    render() {
        return (
            <View style={CommonStyle.mainContainer} onLayout={this.onLayout.bind(this)}>
                <View style={styles.buttonHeader}>
                    <CustomButton
                        visible={true}
                        primary label='Show Filter'
                        width={150}
                        onPress={this.showFilter}/>
                </View>
                <ScrollView style={styles.content_chart}>
                    {this.state.filters.status_new &&
                        <SalesLineChart status='New'
                            chartDataContent={this.state.filters.chartDataContent}
                            labelBy={this.state.filters.labelBy}
                            dateFrom={this.state.filters.dateFrom}
                            dateTo={this.state.filters.dateTo}
                        />
                    }
                    {this.state.filters.status_ordering &&
                        <SalesLineChart status='Ordering'
                            chartDataContent={this.state.filters.chartDataContent}
                            labelBy={this.state.filters.labelBy}
                            dateFrom={this.state.filters.dateFrom}
                            dateTo={this.state.filters.dateTo}
                        />
                    }
                    {this.state.filters.status_paid &&
                        <SalesLineChart status='Paid'
                            chartDataContent={this.state.filters.chartDataContent}
                            labelBy={this.state.filters.labelBy}
                            dateFrom={this.state.filters.dateFrom}
                            dateTo={this.state.filters.dateTo}
                        />
                    }
                    {this.state.filters.status_cancelled &&
                        <SalesLineChart status='Cancelled'
                            chartDataContent={this.state.filters.chartDataContent}
                            labelBy={this.state.filters.labelBy}
                            dateFrom={this.state.filters.dateFrom}
                            dateTo={this.state.filters.dateTo}
                        />
                    }
                    {this.state.filters.status_refund &&
                        <SalesLineChart status='Refund'
                            chartDataContent={this.state.filters.chartDataContent}
                            labelBy={this.state.filters.labelBy}
                            dateFrom={this.state.filters.dateFrom}
                            dateTo={this.state.filters.dateTo}
                        />
                    }
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    buttonHeader: {
        flexDirection: 'row-reverse',
    },
    content_chart: {
        flexDirection: 'column',
    },
});