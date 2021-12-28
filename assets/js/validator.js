function Validator(formSelector) {
  // Lấy ra form element trong DOM theo `formSelector`
  var formElement = document.querySelector(formSelector);

  // Chỉ xử lý khi có element trong DOM
  if (formElement) {
    var inputs = formElement.querySelectorAll("[name][rules]");
  }
}
