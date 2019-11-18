//This is an example code for NavigationDrawer//
import React, { Component } from 'react';
//import react in our code.
import { View, Image, TouchableOpacity } from 'react-native';
// import all basic components
//For React Navigation 2.+ import following
//import {DrawerNavigator, StackNavigator} from 'react-navigation';
//For React Navigation 3.+ import following
import {
  createDrawerNavigator,
  createStackNavigator,
  createAppContainer,
  createBottomTabNavigator,
  createSwitchNavigator,
} from 'react-navigation';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Ionicon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Octicons from 'react-native-vector-icons/Octicons';

import {PAGE_HEADER_BACKGROUND_COLOR} from '../config/constant';
import Colors from '../components/Colors';

// Common screens
import Login from '../screens/common/Login'
import Logout from '../screens/common/Logout';
import About from '../screens/common/About';
import ConnectionSettings from '../screens/common/ConnectionSettings';
import ChangePassword from '../screens/common/ChangePassword';
import History from '../screens/common/History';

// Admin/Vendor screens
import AppUserFeed from '../screens/admin_vendor/AppUserFeed';
import AppUserRegistration from '../screens/admin_vendor/AppUser';

// Admin screens
import VendorFeed from '../screens/admin/VendorFeed';
import VendorRegistration from '../screens/admin/Vendor';

// Vendor screens
import VendorOrderList from '../screens/vendor/OrderList';
import VendorOrderListFilter from '../screens/vendor/OrderFilter';
import Chart from '../screens/vendor/Chart';
import ChartFilter from '../screens/vendor/ChartFilter';
import ProductFeed from '../screens/vendor/ProductFeed';
import ProductRegistration from '../screens/vendor/Product';
import ReferenceList from '../screens/vendor/ReferenceList';
import ReferenceRegistration from '../screens/vendor/ReferenceRegistration';

// Vendor/User screens
import OrderRegistration from '../screens/user_vendor/Order';

// User screens
import OrderList from '../screens/user/OrderList';
import OrderProductList from '../screens/user/ProductList';

export class NavigationDrawerStructure extends Component {
    //Structure for the navigation Drawer
    toggleDrawer = () => {
        //Props to open/close the drawer
        this.props.navigationProps.toggleDrawer();
    };
    render() {
        return (
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={this.toggleDrawer.bind(this)}>
                    {/*Donute Button Image */}
                    <MaterialIcon name="menu" size={30} color="#fff" style={{ width: 25, height: 25, marginLeft: 5 }} />
                </TouchableOpacity>
            </View>
        );
    }
}

// Common Navigation

export const ConnSettingsStack = createStackNavigator({
    ConnectionSettings: {
        screen: ConnectionSettings,
        navigationOptions: ({ navigation }) => ({
            title: 'Connection Setting',
            headerStyle: {
                backgroundColor: PAGE_HEADER_BACKGROUND_COLOR,
            },
            headerTintColor: '#fff',
        }),
    },
});


export const LoginNavigator = createSwitchNavigator(
    {
        Login: {
            screen: Login,
        },
        ConnectionSettings: {
            screen: ConnSettingsStack,
        },
    },
    {
        initialRouteName: "Login"
    }
);

export const LogOutStack = createStackNavigator({
    Logout: {
        screen: Logout,
        navigationOptions: ({ navigation }) => ({
            headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: PAGE_HEADER_BACKGROUND_COLOR,
            },
            headerTintColor: '#fff',
        }),
    },
});


export const ChangePasswordStack = createStackNavigator({
    ChangePassword: {
        screen: ChangePassword,
        navigationOptions: ({ navigation }) => ({
            title: 'Change Password',
            headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: PAGE_HEADER_BACKGROUND_COLOR,
            },
            headerTintColor: '#fff',
        }),
    },
});

export const AboutStack = createStackNavigator({
    About: {
        screen: About,
        navigationOptions: ({ navigation }) => ({
            title: 'About',
            headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: PAGE_HEADER_BACKGROUND_COLOR,
            },
            headerTintColor: '#fff',
        }),
    },
});

export const AppUserStack = createStackNavigator({
    AppUserFeed: {
        screen: AppUserFeed,
        navigationOptions: ({ navigation }) => ({
            title: 'Users',
            headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: PAGE_HEADER_BACKGROUND_COLOR,
            },
            headerTintColor: '#fff',
        }),
    },
    AppUserRegistration: {
        screen: AppUserRegistration,
        navigationOptions: ({ navigation }) => ({
            title: 'User Registration',
            headerStyle: {
                backgroundColor: PAGE_HEADER_BACKGROUND_COLOR,
            },
            headerTintColor: '#fff',
        }),
    },
    History: {
        screen: History,
        navigationOptions: ({ navigation }) => ({
            title: 'History',
            headerStyle: {
                backgroundColor: PAGE_HEADER_BACKGROUND_COLOR,
            },
            headerTintColor: '#fff',
        }),
    },
});



// Admin Navigation

export const VendorStack = createStackNavigator({
    VendorFeed: {
        screen: VendorFeed,
        navigationOptions: ({ navigation }) => ({
            title: 'Vendors',
            headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: PAGE_HEADER_BACKGROUND_COLOR,
            },
            headerTintColor: '#fff',
        }),
    },
    VendorRegistration: {
        screen: VendorRegistration,
        navigationOptions: ({ navigation }) => ({
            title: 'Vendor Registration',
            headerStyle: {
                backgroundColor: PAGE_HEADER_BACKGROUND_COLOR,
            },
            headerTintColor: '#fff',
        }),
    },
    History: {
        screen: History,
        navigationOptions: ({ navigation }) => ({
            title: 'History',
            headerStyle: {
                backgroundColor: PAGE_HEADER_BACKGROUND_COLOR,
            },
            headerTintColor: '#fff',
        }),
    },
});

export const AdminDashboardTabNavigator = createBottomTabNavigator({
    Vendor: {
        screen: VendorStack,
        navigationOptions: {
            title: 'Vendors',
            tabBarIcon: ({ tintColor }) => (
                <FontAwesome5 name="store" size={20} color="#900" />
            ),
        },
    },
    AppUser: {
        screen: AppUserStack,
        navigationOptions: {
            title: 'Users',
            tabBarIcon: ({ tintColor }) => (
                <FontAwesome name="users" size={20} color="#900" />
            ),
        },
    },
});

export const MainAdminNavigator = createDrawerNavigator({
    //Drawer Options and indexing
    Dashboard: {
        //Title
        screen: AdminDashboardTabNavigator,
        navigationOptions: {
            drawerLabel: 'Dashboard',
            drawerIcon: ({ tintColor }) => (
            <MaterialIcon name="dashboard" size={25} color="#900" />
            ),
        },
    },
    ChangePassword: {
        //Title
        screen: ChangePasswordStack,
        navigationOptions: {
            drawerLabel: 'Change Password',
            drawerIcon: <MaterialCommunityIcons name="account-key" size={25} color="#900" />,
        },
    },
    About: {
        //Title
        screen: AboutStack,
        navigationOptions: {
            drawerLabel: 'About',
            drawerIcon: <Octicons name="versions" size={25} color="#900" />,
        },
    },
    Logout: {
        //Title
        screen: Logout,
        navigationOptions: {
            drawerLabel: 'Logout',
            drawerIcon: <Entypo name="log-out" size={25} color="#900" />,
        },
    },
});


// Vendor Navigation

export const VendorOrderListSwitch = createSwitchNavigator(
    {
        OrderList: {
            screen: VendorOrderList,
        },
        OrderFilter: {
            screen: VendorOrderListFilter,
        },
    },
    {
        initialRouteName: "OrderList"
    });

export const VendorOrderListStack = createStackNavigator({
    OrderList: {
        screen: VendorOrderListSwitch,
        navigationOptions: ({ navigation }) => ({
            title: 'Orders',
            headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: PAGE_HEADER_BACKGROUND_COLOR,
            },
            headerTintColor: '#fff',
        }),
    },
    OrderItem: {
        screen: OrderRegistration,
        navigationOptions: ({ navigation }) => ({
            title: 'Order Detail',
            headerStyle: {
                backgroundColor: PAGE_HEADER_BACKGROUND_COLOR,
            },
            headerTintColor: '#fff',
        }),
    },
    History: {
        screen: History,
        navigationOptions: ({ navigation }) => ({
            title: 'History',
            headerStyle: {
                backgroundColor: PAGE_HEADER_BACKGROUND_COLOR,
            },
            headerTintColor: '#fff',
        }),
    },
});

export const ReferenceStack = createStackNavigator({
    ReferenceList: {
        screen: ReferenceList,
        navigationOptions: ({ navigation }) => ({
            title: 'Reference Data',
            headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: PAGE_HEADER_BACKGROUND_COLOR,
            },
            headerTintColor: '#fff',
        }),
    },
    ReferenceRegistration: {
        screen: ReferenceRegistration,
        navigationOptions: ({ navigation }) => ({
            title: 'Reference Registration',
            headerStyle: {
                backgroundColor: PAGE_HEADER_BACKGROUND_COLOR,
            },
            headerTintColor: '#fff',
        }),
    },
});

export const ProductStack = createStackNavigator({
    ProductFeed: {
        screen: ProductFeed,
        navigationOptions: ({ navigation }) => ({
            title: 'Products',
            headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: PAGE_HEADER_BACKGROUND_COLOR,
            },
            headerTintColor: '#fff',
        }),
    },
    ProductRegistration: {
        screen: ProductRegistration,
        navigationOptions: ({ navigation }) => ({
            title: 'Product Registration',
            headerStyle: {
                backgroundColor: PAGE_HEADER_BACKGROUND_COLOR,
            },
            headerTintColor: '#fff',
        }),
    },
    History: {
        screen: History,
        navigationOptions: ({ navigation }) => ({
            title: 'History',
            headerStyle: {
                backgroundColor: PAGE_HEADER_BACKGROUND_COLOR,
            },
            headerTintColor: '#fff',
        }),
    },
});

export const ChartSwitch = createSwitchNavigator(
    {
        Chart: {
            screen: Chart,
        },
        ChartFilter: {
            screen: ChartFilter,
        },
    },
    {
        initialRouteName: "Chart"
    });

export const ChartStack = createStackNavigator({
    Chart: {
        screen: ChartSwitch,
        navigationOptions: ({ navigation }) => ({
            title: 'Chart',
            headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: PAGE_HEADER_BACKGROUND_COLOR,
            },
            headerTintColor: '#fff',
        }),
    },
});

export const VendorDashboardTabNavigator = createBottomTabNavigator({
    OrderList: {
        screen: VendorOrderListStack,
        navigationOptions: {
            title: 'Orders',
            tabBarIcon: ({ tintColor }) => (
                <MaterialIcon name="shopping-cart" size={20} color="#900"  />
            ),
        },
    },
    Chart: {
        screen: ChartStack,
        navigationOptions: {
            title: 'Chart',
            tabBarIcon: ({ tintColor }) => (
                <FontAwesome name="bar-chart" size={20} color="#900" />
            ),
        },
    },
    AppUser: {
        screen: AppUserStack,
        navigationOptions: {
            title: 'Users',
            tabBarIcon: ({ tintColor }) => (
                <FontAwesome name="users" size={20} color="#900" />
            ),
        },
    },
    Product: {
        screen: ProductStack,
        navigationOptions: {
            title: 'Products',
            tabBarIcon: ({ tintColor }) => (
                <FontAwesome5 name="product-hunt" size={20} color="#900" />
            ),
        },
    },
});

export const MainVendorNavigator = createDrawerNavigator({
    //Drawer Options and indexing
    Dashboard: {
        //Title
        screen: VendorDashboardTabNavigator,
        navigationOptions: {
            drawerLabel: 'Dashboard',
            drawerIcon: ({ tintColor }) => (
                <MaterialIcon name="dashboard" size={25} color="#900"  />
            ),
        },
    },
    Reference: {
        screen: ReferenceStack,
        navigationOptions: {
            drawerLabel: 'Reference Data',
            drawerIcon: <Ionicon name="md-settings" size={25} color="#900" />,
        }
    },
    ChangePassword: {
        //Title
        screen: ChangePasswordStack,
        navigationOptions: {
            drawerLabel: 'Change Password',
            drawerIcon: <MaterialCommunityIcons name="account-key" size={25} color="#900" />,
        },
    },
    About: {
        //Title
        screen: AboutStack,
        navigationOptions: {
            drawerLabel: 'About',
            drawerIcon: <Octicons name="versions" size={25} color="#900" />,
        },
    },
    Logout: {
        //Title
        screen: Logout,
        navigationOptions: {
            drawerLabel: 'Logout',
            drawerIcon: <Entypo name="log-out" size={25} color="#900" />,
        },
    },
});

// User Navigation
export const OrderListStack = createStackNavigator({
    OrderList: {
        screen: OrderList,
        navigationOptions: ({ navigation }) => ({
            title: 'Orders',
            headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: PAGE_HEADER_BACKGROUND_COLOR,
            },
            headerTintColor: '#fff',
        }),
    },
    OrderItem: {
        screen: OrderRegistration,
        navigationOptions: ({ navigation }) => ({
            title: 'Order Detail',
            headerStyle: {
                backgroundColor: PAGE_HEADER_BACKGROUND_COLOR,
            },
            headerTintColor: '#fff',
        }),
    },
    OrderProduct: {
        screen: OrderProductList,
        navigationOptions: ({ navigation }) => ({
            title: 'Product Selection',
            headerStyle: {
                backgroundColor: PAGE_HEADER_BACKGROUND_COLOR,
            },
            headerTintColor: '#fff',
        }),
    },
});

export const MainUserNavigator = createDrawerNavigator({
    //Drawer Options and indexing
    Dashboard: {
        //Title
        screen: OrderListStack,
        navigationOptions: {
            drawerLabel: 'Dashboard',
            drawerIcon: ({ tintColor }) => (
                <MaterialIcon name="dashboard" size={25} color="#900"  />
            ),
        },
    },
    ChangePassword: {
        //Title
        screen: ChangePasswordStack,
        navigationOptions: {
            drawerLabel: 'Change Password',
            drawerIcon: <MaterialCommunityIcons name="account-key" size={25} color="#900" />,
        },
    },
    About: {
        //Title
        screen: AboutStack,
        navigationOptions: {
            drawerLabel: 'About',
            drawerIcon: <Octicons name="versions" size={25} color="#900" />,
        },
    },
    Logout: {
        //Title
        screen: Logout,
        navigationOptions: {
            drawerLabel: 'Logout',
            drawerIcon: <Entypo name="log-out" size={25} color="#900" />,
        },
    },
});

//For React Navigation 2.+ need to export App only
//export default App;
//For React Navigation 3.+
//export const MainAppContainer = createAppContainer(MainAdminNavigator);
//export const LoginAppContainer = createAppContainer(LoginNavigator);

export const createRootNavigator = (signedIn = false, layout = "Login") => {
    return createAppContainer(
        createSwitchNavigator(
            {
                Login: {
                     screen: LoginNavigator,
                },
                Admin: {
                    screen: MainAdminNavigator,
                },
                Vendor: {
                    screen: MainVendorNavigator,
                },
                User: {
                    screen: MainUserNavigator,
                },

            },
            {
                initialRouteName: ( signedIn ? layout : "Login" )
            }
        )
    );
};
