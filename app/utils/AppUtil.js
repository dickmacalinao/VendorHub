export const createVendorList = (objVendors) => {
     var tmpVendors = [];
     var tmpVendor = {};
     objVendors.forEach(function (item, index) {
         tmpVendor = {};
         tmpVendor.value = item.id;
         tmpVendor.label = item.name;
         tmpVendors.push(tmpVendor);
     });
     return tmpVendors;
     //alert(JSON.stringify(tmpVendors))
     //this.setState({vendors: tmpVendors});
     //AsyncStorage.setItem('Vendors', JSON.stringify(tmpVendors));
 }