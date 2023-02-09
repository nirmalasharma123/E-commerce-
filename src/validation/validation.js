
const isValid = function(value) { 
    if (typeof value == 'undefined' || value == null) return false;
    if (typeof value == 'string' && value.trim().length === 0) return false;
    return true;
  }
  
  
  const isValidMobile = function (name) {
      const validName = /^[6-9]{1}[0-9]{9}$/;
      return validName.test(name);
    };
    const isValidPassword = (value) => {
      const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*#?&]{8,15}$/  
      return passRegex.test(value)
  };
  const isValidCity = function(value){
      const city= (/^[A-Z a-z]+$/);
      return city.test(value)
      }
  
  const isValidPin = function(value){
      return (/^[1-9][0-9]{5}$/).test(value)
      }
  const isValidPrice = function(value){
        return (/^(?:\d*\.\d{1,2}|\d+)$/).test(value)
      }
  
  
  
  
    module.exports={isValidMobile,isValidPassword,isValidPin,isValid,isValidPin,isValidCity,isValidPrice}