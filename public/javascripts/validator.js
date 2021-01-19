function Validator(options){
    
    function getParent(element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    // Hàm thực hiện validate
    function validate(inputElement, rule){
        
        
            // value: inputElement.value
            // test func: rule.test
            // var errorMessage = rule.test (inputElement.value);
            var errorMessage = getParent(inputElement, options.formGroup);
            var errorElement=getParent(inputElement, options.formGroup).querySelector(options.errorSelector);
            
            // Lấy ra các rules của selector
            var rules = selectorRules[rule.selector];

            // Lặp qa từng rule và kĩm tra
            // Nếu có lỗi thì dừng viẹc kĩm tra
            for( var i = 0; i<rules.length; ++i ){
                switch(inputElement.type){
                    case 'radio':
                        errorMessage = rules[i](
                            formElement.querySelector(rule.selector + ':checked')
                        );
                        break;
                    case 'checkbox':
                        errorMessage = rules[i](
                            formElement.querySelector(rule.selector + ':checked')
                        );
                        break;
                    default:
                        errorMessage = rules[i](inputElement.value);
                }
                
                if(errorMessage) break;
            }

            if(errorMessage){
                errorElement.innerText = errorMessage;
                getParent(inputElement, options.formGroup).classList.add('invalid'); 
            }
            else {
                errorElement.innerText = '';
                getParent(inputElement, options.formGroup).classList.remove('invalid'); 
            

        }
        return ! errorMessage;
    }

    // Lấy element của form cần validate
    var formElement= document.querySelector(options.form);

    var selectorRules = {};

    

    if (formElement) {
        // Khi submit form
        formElement.onsubmit = function (e) {
            e.preventDefault();

            var isFormValid= true;

                // Lặp qua từng rules và validate
            options.rules.forEach(function (rule) {
                
                var inputElement = formElement.querySelector(rule.selector);

                var isValid = validate(inputElement,rule);   
                if(!isValid){
                    isFormValid = false;
                }            
            });
            
            if(isFormValid){
                // Submit vs JS
                if(typeof options.onSubmit === 'function'){
                    
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');

                    var formValues = Array.from(enableInputs).reduce(function (values,input){
                        switch(input.type){
                            case 'radio':
                                // values[input.name]=input.value;
                                // break;
                                values[input.name]=formElement.querySelector('input[name="'+ input.name + '"]:checked').value;
                                break;
                                case 'checkbox':  
                                if(!input.matches(':checked')) {
                                    values[input.name]=[];
                                    return values;}                                
                                if(!Array.isArray(values[input.name])){
                                    values[input.name]=[];
                                }
                                values[input.name].push(input.value);
                                
                                break;
                                case 'file':
                                    values[input.name]=input.files;                               
                                    break;
                            default:
                                values[input.name]=input.value;
                        }
                        return  values;
                    },{});
                    options.onSubmit(formValues);
                }
                // Submit vs default
                else {
                        formElement.submit();
                }
                
            }
        }
        // Lặp qa mỗi rule và xử lí( Lắng nge sự kiện blur, input,...)
        options.rules.forEach(function (rule){

            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            }
            else{
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElements= formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(function(inputElement){
                if(inputElement){
                    // Xử lý mỗi khi blur ra khõi input
                    inputElement.onblur = function(){
                        validate(inputElement,rule);
                    }
                    
    
                    // Xử lý mỗi khi người dùng nhập vào input
                    inputElement.oninput = function(){
                        var errorElement=getParent(inputElement, options.formGroup).querySelector(options.errorSelector);
                        errorElement.innerText = '';
                        getParent(inputElement, options.formGroup).classList.remove('invalid'); 
                    }
    
                }
            });
            
        });
    }
}

var isNumber = function (char) {
    // if(char>=48 && char <=57)
    // return true;
    // return false;
    return (char>=48 && char<= 57)? true : false;
}

var isLetter = function (char) {
    return (char>=65 && char<=90) ||
    (char>=97 && char<=122) ? true : false;
}

var isSpecialKey = function (char) {
    return((!isNumber(char)) && (!isLetter(char)) && (char>=33 && char<=126) ) ? true : false;
}

Validator.isRequired= function (selector,msg){
    return {
        selector: selector ,
        test: function (value) {
            return value ? undefined : msg || 'Vui lòng nhập thông tin';
        }
    };
}

Validator.isEmail= function(selector,msg){
    return {
        selector: selector ,
        test: function (value) {
            var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            return regex.test(value)? undefined : msg || 'Vui lòng nhập đúng định dạng i meo';
        }
    };
}

Validator.minLength= function(selector,min,msg){
    return {
        selector: selector ,
        test: function (value) {
            
            return value.length>=min? undefined : msg || `Vui lòng nhập tối thĩu ${min} kí tự`;
        }
    };
}

Validator.isConfirmed= function(selector,getConfirmValue,msg){
    return {
        selector: selector ,
        test: function (value) {
            
            return value===getConfirmValue()? undefined : msg || `Nhập lại đúng mật khẩu`;
        }
    };
}

Validator.isAccount= function(selector,msg){
    return {
        selector: selector ,
        test: function (value) {
            var flag= true;
            for( var i = 0; i< value.length; ++i){
                if(isNumber(value.charCodeAt(i)) || isLetter(value.charCodeAt(i)) )
                    continue;
                else {
                    flag=false;
                    break;
                }
            }

            return flag? undefined : msg || `Vui lòng nhập đúng cú pháp`;
        }
    };
}

Validator.isPassword= function(selector,msg){
    return {
        selector: selector ,
        test: function (value) {
            var haveChar = haveNumb = haveSpecialKey = false;
            var i = 0;
                while(haveChar === haveNumb === haveSpecialKey === false && i< value.length){
                    if(isLetter(value.charCodeAt(i)))
                        haveChar=true;
                    if(isNumber(value.charCodeAt(i)))
                        haveNumb=true;
                    if(isSpecialKey(value.charCodeAt(i)))
                        haveSpecialKey=true;
                    ++i;
                }
            console.log(haveChar, haveNumb, haveSpecialKey);
            return (haveChar && haveNumb && haveSpecialKey)? undefined : msg || `Nhập lại đúng mật khẩu`;
        }
    };
}