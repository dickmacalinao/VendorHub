import validate from 'validate.js';
import ValidationScheme from '../components/ValidationScheme';

convertValErrorToAppError = (valError) => {
    var errMsgs = [];
    {valError.map((msg) => (
        errMsgs.push({
            type: 'ERROR',
            message: msg
        })
    ))}
    return errMsgs;
}

appendErrorList = (errorList, newErrors) => {
    var newErrorList = [];
    {newErrors.map((error) => (
        newErrorList.push(error)
    ))}
    return newErrorList;
}

validateForm = (formData, validationScheme) => {

    var errors = [];
    var result = validate(formData, validationScheme);

    for ( var validatedField in result ) {
        errors.push(result[validatedField]);
    }

    return errors;
}