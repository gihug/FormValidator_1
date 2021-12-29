function Validator(formSelector) {
  var formRules = {};
  /**
   * Quy ước tạo rule:
   * - Nếu có lỗi thì return `error message`
   * - Nếu không có lỗi thì return `undefined`
   * */
  var validatorRules = {
    required: function (value) {
      return value ? undefined : "Vui lòng nhập trường này!";
    },
    email: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : "Trường này phải là email!";
    },
    min: function (min) {
      return function (value) {
        return value.length > min
          ? undefined
          : `Vui lòng nhập ít nhất ${min} kí tự.`;
      };
    },
    max: function (max) {
      return function (value) {
        return value.length < max
          ? undefined
          : `Vui lòng nhập tối đa ${max} kí tự.`;
      };
    },
  };
  // Lấy ra form element trong DOM theo `formSelector`
  var formElement = document.querySelector(formSelector);

  // Chỉ xử lý khi có element trong DOM
  if (formElement) {
    var inputs = formElement.querySelectorAll("[name][rules]");

    for (const input of inputs) {
      var rules = input.getAttribute("rules").split("|");
      for (const rule of rules) {
        var ruleInfo;
        var isRuleHasValue = rule.includes(":");
        if (isRuleHasValue) {
          ruleInfo = rule.split(":");
          rule = ruleInfo[0];
        }
        var ruleFunc = validatorRules[rule];
        if (isRuleHasValue) {
          ruleFunc = ruleFunc([1]);
        }
      }

      if (Array.isArray(formRules[input.name])) {
        formRules[input.name].push(ruleFunc);
      } else {
        formRules[input.name] = [ruleFunc];
      }
    }

    // Lắng nghe sự kiện để validate (blur, change, ...)

    input.onblur = handleValidate;
  }

  // Hàm thực hiện validate
  function handleValidate(event) {}
}
