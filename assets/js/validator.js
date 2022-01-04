"use strict";
function Validator(formSelector) {
  var formRules = {};
  var _this = this;

  function getParent(element, selector) {
    while (element.parentElement) {
      // Nếu tìm thấy thằng selector thì return
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      // Gán nó bằng cha nó rồi đi tìm thằng selector
      element = element.parentElement;
    }
  }
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
    // Lấy từng rule của từng thẻ input
    for (var input of inputs) {
      // Thực hiện lấy ra mảng các rule exp:`required|min:6` => [required,min:6]
      var rules = input.getAttribute("rules").split("|");
      for (var rule of rules) {
        var ruleInfo;
        // Thực hiện lấy ra mảng các mảng rule của rule con exp:`min:6` => [min,6]
        var isRuleHasValue = rule.includes(":");
        // Nếu có gán lại rule = min
        if (isRuleHasValue) {
          ruleInfo = rule.split(":");
          rule = ruleInfo[0];
        }
        // gán func theo key exp: min => function min()
        var ruleFunc = validatorRules[rule];
        // Tồn tại mảng rule con exp:`min:6`
        if (isRuleHasValue) {
          // gán func con của func cha những rule có yêu cầu params
          ruleFunc = ruleFunc(ruleInfo[1]);
        }

        if (Array.isArray(formRules[input.name])) {
          formRules[input.name].push(ruleFunc);
        } else {
          formRules[input.name] = [ruleFunc];
        }
      }
      // Lắng nghe sự kiện để validate (blur, change, ...)
      input.onblur = handleValidate;
      input.oninput = handleClearError;
    }
  }

  // Hàm thực hiện validate
  function handleValidate(event) {
    //Trả về func validate
    var rules = formRules[event.target.name];
    var errorMessage;
    rules.some(function (rule) {
      errorMessage = rule(event.target.value);
      return errorMessage;
    });

    if (errorMessage) {
      var formGroup = getParent(event.target, ".form-group");
      if (formGroup) {
        formGroup.classList.add("invalid");
        var formMessage = formGroup.querySelector(".form-message");
        if (formMessage) {
          formMessage.innerText = errorMessage;
        }
      }
    }

    return !errorMessage;
  }

  // Hàm thực hiện loại bỏ error khi input được nhập
  function handleClearError(event) {
    var formGroup = getParent(event.target, ".form-group");
    if (formGroup.classList.contains("invalid")) {
      formGroup.classList.remove("invalid");
      var formMessage = formGroup.querySelector(".form-message");
      if (formMessage) {
        formMessage.innerText = "";
      }
    }
  }
  // Xử lý hành vi submit form
  formElement.onsubmit = function (event) {
    event.preventDefault();
    var inputs = formElement.querySelectorAll("[name][rules]");
    var isFormValid = false;
    for (var input of inputs) {
      if (!handleValidate({ target: input })) {
        isFormValid = true;
      }
    }
    //Khi không có lỗi
    if (!isFormValid) {
      if (typeof _this.onSubmit === "function") {
        var enableInputs = formElement.querySelectorAll(
          "[name]:not([disabled])"
        );
        var formValues = Array.from(enableInputs).reduce((values, input) => {
          switch (input.type) {
            case "radio":
              values[input.name] =
                formElement.querySelector(`input[name="${input.name}"]:checked`)
                  ?.value || "";
              break;
            case "checkbox":
              if (!input.matches(":checked")) {
                values[input.name] = "";
                return values;
              }
              if (!Array.isArray(values[input.name])) {
                values[input.name] = [];
              }
              values[input.name].push(input.value);
              break;
            case "file":
              values[input.name] = input.files;
              break;
            default:
              values[input.name] = input.value;
          }

          return values;
        }, {});
        _this.onSubmit(formValues);
      } else {
        formElement.submit();
      }
    }
  };
}
