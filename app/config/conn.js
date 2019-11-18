export default [
   {'value': 'DEV', 'label': 'Development Server',
       'services': [
           {'id': 'AuthServiceURL', 'externalService': 'http://192.168.1.10:8762/auth', 'internalService': 'http://192.168.1.10:6010'},
           {'id': 'AppUserServiceURL', 'externalService': 'http://192.168.1.10:8762/appuser', 'internalService': 'http://192.168.1.10:6020'},
           {'id': 'ConfigServiceURL', 'externalService': 'http://192.168.1.10:8762/vendorhubcore/config', 'internalService': 'http://192.168.1.10:6030'},
           {'id': 'VendorServiceURL', 'externalService': 'http://192.168.1.10:8762/vendorhubcore/vendor', 'internalService': 'http://192.168.1.10:6030'},
           {'id': 'ProductServiceURL', 'externalService': 'http://192.168.1.10:8762/vendorhubcore/product', 'internalService': 'http://192.168.1.10:6030'},
           {'id': 'OrderServiceURL', 'externalService': 'http://192.168.1.10:8762/vendorhuborder', 'internalService': 'http://192.168.1.10:6040'},
           {"id": "CloudinaryVendor", "externalService": "https://api.cloudinary.com/v1_1/ckidtech/image/upload?upload_preset=VENDORHUB-DEV-VENDOR", "internalService": ""},
           {"id": "CloudinaryProduct", "externalService": "https://api.cloudinary.com/v1_1/ckidtech/image/upload?upload_preset=VENDORHUB-DEV-PRODUCT", "internalService": ""},
       ]
   },
   {'value': 'SIT', 'label': 'System Integration Server',
       'services': [
           {'id': 'AuthServiceURL', 'externalService': 'https://ckidtech-srv-zuul.herokuapp.com/auth', 'internalService': 'https://ckidtech-srv-auth.herokuapp.com/'},
           {'id': 'AppUserServiceURL', 'externalService': 'https://ckidtech-srv-zuul.herokuapp.com/appuser', 'internalService': 'https://ckidtech-srvc-appuser.herokuapp.com/'},
           {'id': 'ConfigServiceURL', 'externalService': 'https://ckidtech-srv-zuul.herokuapp.com/vendorhubcore/config', 'internalService': 'https://ckidtech-srvc-vndrhubcore.herokuapp.com/'},
           {'id': 'VendorServiceURL', 'externalService': 'https://ckidtech-srv-zuul.herokuapp.com/vendorhubcore/vendor', 'internalService': 'https://ckidtech-srvc-vndrhubcore.herokuapp.com/'},
           {'id': 'ProductServiceURL', 'externalService': 'https://ckidtech-srv-zuul.herokuapp.com/vendorhubcore/product', 'internalService': 'https://ckidtech-srvc-vndrhubcore.herokuapp.com/'},
           {'id': 'OrderServiceURL', 'externalService': 'https://ckidtech-srv-zuul.herokuapp.com/vendorhuborder', 'internalService': 'https://ckidtech-srvc-vndrhuborder.herokuapp.com/'},
           {"id": "CloudinaryVendor", "externalService": "https://api.cloudinary.com/v1_1/ckidtech/image/upload?upload_preset=VENDORHUB-SIT-VENDOR", "internalService": ""},
           {"id": "CloudinaryProduct", "externalService": "https://api.cloudinary.com/v1_1/ckidtech/image/upload?upload_preset=VENDORHUB-SIT-PRODUCT", "internalService": ""},
        ]
   },
   {'value': 'PROD', 'label': 'Production Server',
       'services': [
           {'id': 'AuthServiceURL', 'externalService': 'https://ckidtech-srv-zuulprd.herokuapp.com/auth', 'internalService': 'https://ckidtech-srv-authprd.herokuapp.com/'},
           {'id': 'AppUserServiceURL', 'externalService': 'https://ckidtech-srv-zuulprd.herokuapp.com/appuser', 'internalService': 'https://ckidtech-srvc-appuserprd.herokuapp.com/'},
           {'id': 'ConfigServiceURL', 'externalService': 'https://ckidtech-srv-zuulprd.herokuapp.com/vendorhubcore/config', 'internalService': 'https://ckidtech-srvc-vndrhubcoreprd.herokuapp.com/'},
           {'id': 'VendorServiceURL', 'externalService': 'https://ckidtech-srv-zuulprd.herokuapp.com/vendorhubcore/vendor', 'internalService': 'https://ckidtech-srvc-vndrhubcoreprd.herokuapp.com/'},
           {'id': 'ProductServiceURL', 'externalService': 'https://ckidtech-srv-zuulprd.herokuapp.com/vendorhubcore/product', 'internalService': 'https://ckidtech-srvc-vndrhubcoreprd.herokuapp.com/'},
           {'id': 'OrderServiceURL', 'externalService': 'https://ckidtech-srv-zuulprd.herokuapp.com/vendorhuborder', 'internalService': 'https://ckidtech-srvc-vndrhuborderprd.herokuapp.com/'},
           {"id": "CloudinaryVendor", "externalService": "https://api.cloudinary.com/v1_1/ckidtech/image/upload?upload_preset=VENDORHUB-PROD-VENDOR", "internalService": ""},
           {"id": "CloudinaryProduct", "externalService": "https://api.cloudinary.com/v1_1/ckidtech/image/upload?upload_preset=VENDORHUB-PROD-PRODUCT", "internalService": ""},
        ]
    },
];