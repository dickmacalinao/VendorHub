const ValidationScheme = {
    Login: {
        username: {
            presence: {
                allowEmpty: false,
                message: "^Username is required."
            },
        },
        password: {
            presence: {
                allowEmpty: false,
                message: "^Password is required."
            },
        },
    },
    VendorRegistration: {
        name: {
            presence: {
                allowEmpty: false,
                message: "^Vendor Name is required."
            },
            length: {
                maximum: 100,
                message: "^Vendor Name should not exceed 100 characters.",
            },
        },
    },
    AppUserRegistration: {
        username: {
            presence: {
                allowEmpty: false,
                message: "^Username is required."
            },
            length: {
                maximum: 20,
                message: "^App User ID should not exceed 20 characters.",
            },
        },
        name: {
            presence: {
                allowEmpty: false,
                message: "^App User Name is required."
            },
            length: {
                maximum: 100,
                message: "^App User Name should not exceed 100 characters.",
            },
        },
        role: {
            presence: {
                allowEmpty: false,
                message: "^App User Role is required."
            },
        },
        objectRef: function(value, attributes, attributeName) {
            if ( attributes.role=='APP_ADMIN' ) return null;
            return {
                presence: {
                    allowEmpty: false,
                    message: "^App User Vendor is required."
                }
            };
        },
    },
    AppUserUpdate: {
        id: {
            presence: {
                allowEmpty: false,
                message: "^App User ID is required."
            },
        },
        name: {
            presence: {
                allowEmpty: false,
                message: "^App User Name is required."
            },
            length: {
                maximum: 100,
                message: "^App User Name should not exceed 100 characters.",
            },
        },
        role: {
            presence: {
                allowEmpty: false,
                message: "^App User Role is required."
            },
        },
        objectRef: function(value, attributes, attributeName) {
            if ( attributes.role=='APP_ADMIN' ) return null;
            return {
                presence: {
                    allowEmpty: false,
                    message: "^App User Vendor is required."
                }
            };
        },
    },
    ChangePassword: {
        newPassword: function(value, attributes, attributeName) {
            if ( attributes.newPassword ) {
                if ( attributes.newPassword.length <8 ) {
                    return {
                        length: {
                            minimum: 8,
                            message: "^New Password should at least 8 characters.",
                        }
                    }
                } else if ( attributes.newPassword.length > 20) {
                    return {
                        length: {
                            maximum: 20,
                            message: "^New Password should not exceed 20 characters.",
                        }
                    }
                } else return null;
            } else {
                return {
                    presence: {
                        allowEmpty: false,
                        message: "^New Password is required."
                    }
                }
            }
        },
    },
    ProductRegistration: {
        id: function(value, attributes, attributeName) {
            if ( attributes.updateMode==true ) {
                return {
                    presence: {
                        allowEmpty: false,
                        message: "^Product ID is required."
                    }
                };
            }
            return null;
        },
        group: {
            presence: {
                allowEmpty: false,
                message: "^Product Group is required."
            },
            length: {
                maximum: 50,
                message: "^Product Group should not exceed 50 characters.",
            },
        },
        name: {
            presence: {
                allowEmpty: false,
                message: "^Product Name is required."
            },
            length: {
                maximum: 50,
                message: "^Product Name should not exceed 50 characters.",
            },
        },
        "prodComp.basePrice": {
            presence: {
                allowEmpty: false,
                message: "^Base Price is required."
            },
            numericality: {
                greaterThanOrEqualTo: 0,
                message: "^Base Price should be positive numeric.",
            }
        },
        prodCompFeatureDiscount: {
            numericality: {
                greaterThanOrEqualTo: 0,
                lessThanOrEqualTo: 100,
                message: "^Promotional Discount should be numeric and between 0 and 100.",
            }
        },
    },
    ProductRegistrationUpdate: {
        id: {
            presence: {
                allowEmpty: false,
                message: "^Product ID is required."
            },
            length: {
                maximum: 20,
                message: "^Product ID should not exceed 10 characters.",
            },
        },
    },
    ReferenceRegistration: {
        grantTo: {
            presence: {
                allowEmpty: false,
                message: "^Grant to is required."
            },
        },
        refGroup: {
            presence: {
                allowEmpty: false,
                message: "^Reference Group is required."
            },
        },
        name: function(value, attributes, attributeName) {
            if ( attributes.refGroup=='ProductGroup' ) return null;
            return {
                presence: {
                    allowEmpty: false,
                    message: "^Name is required."
                }
            };
        },
        value: function(value, attributes, attributeName) {
            if ( attributes.refGroup=='Discount' ) return {
                presence: {
                    allowEmpty: false,
                    message: "^Value is required."
                },
                numericality: {
                    greaterThan: 0,
                    lessThanOrEqualTo: 100,
                    message: "^Discount should be numeric and between 0 and 100.",
                }
            };
            return {
                presence: {
                    allowEmpty: false,
                    message: "^Value is required."
                },
                length: {
                    maximum: 100,
                    message: "^Value should not exceed 50 characters.",
                },
            };
        },
    },
    SettlePayment: {
        totalAmount: {
            presence: true,
            numericality: {
                greaterThan: 0,
            }
        },
    },
}

export default ValidationScheme