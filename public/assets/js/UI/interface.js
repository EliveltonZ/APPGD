import Swal from "../sweetalert2.esm.all.min.js";

export const q = (element) => {
  return document.querySelector(element);
};

export const qa = (element) => {
  return document.querySelectorAll(element);
};

export const ce = (element) => {
  return document.createElement(element);
};

export class Dom {
  static getValue(element) {
    const value = q(element).value;
    return value === "" ? null : value.toUpperCase();
  }

  static setValue(element, value) {
    q(element).value = value;
  }

  static setInnerHtml(element, value) {
    q(element).innerHTML = value;
  }

  static getChecked(element) {
    let value = q(element).checked;
    return value === "" ? null : value;
  }

  static setChecked(element, boolean) {
    q(element).checked = boolean;
  }

  static setFocus(element) {
    q(element).focus();
  }

  static getElement(element) {
    const el = q(element);
    return el;
  }

  static createElement(element, value, style = "", className = null) {
    const el = ce(element);
    el.textContent = Dom.checkValue(value);
    el.setAttribute("style", style);
    if (className) el.classList.add(className);
    return el;
  }

  static checkValue(value) {
    if (value) {
      return value;
    } else {
      return "-";
    }
  }

  static clearInputFields(exceptionsIds = []) {
    // Seleciona todos os campos de entrada, incluindo text, checkbox, select e date
    const allFields = qa(
      'input[type="text"], input[type="checkbox"], select, input[type="date"]'
    );

    allFields.forEach((field) => {
      // Verificar se o campo não está na lista de exceções pelos IDs
      if (!exceptionsIds.includes(field.id)) {
        if (field.type === "text") {
          field.value = "";
        } else if (field.type === "checkbox") {
          field.checked = false;
        } else if (field.tagName.toLowerCase() === "select") {
          field.value = "";
        } else if (field.type === "date") {
          field.value = "";
        }
      }
    });
  }

  static rowClick(tableId) {
    const table = q(tableId);
    if (!table) {
      console.warn(`Tabela com ID "${tableId}" não encontrada.`);
      return;
    }

    let selectedRow = null;

    table.addEventListener("click", (event) => {
      if (event.target.tagName === "TD") {
        var clickedRow = event.target.parentElement;

        if (selectedRow && selectedRow !== clickedRow) {
          selectedRow.classList.remove("table-click-row");
        }

        if (selectedRow !== clickedRow) {
          clickedRow.classList.add("table-click-row");
          selectedRow = clickedRow;
        } else {
          clickedRow.classList.remove("table-click-row");
          selectedRow = null;
        }
      } else {
      }
    });
  }

  // função para manipular eventos de elementos
  static addEventBySelector(element, event, _function) {
    const elements = qa(element);
    if (elements.length) {
      elements.forEach((el) => {
        el.addEventListener(event, _function);
      });
    } else {
      console.warn(
        `Nenhum elemento com o seletor "${element}" foi encontrado.`
      );
    }
  }

  static handleClass(element, nameClass, action) {
    // Obtém o elemento pelo Seletor
    const item = q(element);

    // Verifica se o item existe
    if (!item) {
      console.error(`Elemento com ID "${element}" não encontrado.`);
      return;
    }

    // Verifica se o nome da classe é válido
    if (!nameClass || typeof nameClass !== "string") {
      console.error("O nome da classe não é válido.");
      return;
    }

    // Verifica o tipo de operação e executa
    if (action.toLowerCase() === "add") {
      item.classList.add(nameClass);
      return;
    }
    if (action.toLowerCase() === "remove") {
      item.classList.remove(nameClass);
      return;
    }

    // Caso o tipo não seja reconhecido
    console.error(`Tipo de operação "${action}" não identificado.`);
  }

  static setUpperCase(input) {
    input.value = input.value.toUpperCase();
  }

  static allUpperCase() {
    qa('input[type="text"]').forEach((input) => {
      input.addEventListener("input", function () {
        Dom.setUpperCase(input);
      });
    });
  }

  static enableEnterAsTab() {
    const inputs = qa("input, select, textarea, button");
    inputs.forEach((input) => {
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();

          if (input.tagName === "BUTTON") {
            input.click();
            return;
          }

          let index = Array.from(inputs).indexOf(input);
          let nextElement = inputs[index + 1];

          while (nextElement && nextElement.disabled) {
            index++;
            nextElement = inputs[index + 1];
          }

          if (nextElement) {
            nextElement.focus();
          }
        }
      });
    });
  }
}

export class Table {
  static getIndexColumnValue(td, index) {
    const row = td.parentNode;
    return row.cells[index].innerText;
  }

  static onclickHighlightRow(tableId) {
    const table = q(tableId);
    if (!table) {
      console.warn(`Tabela com ID "${tableId}" não encontrada.`);
      return;
    }

    let selectedRow = null;

    table.addEventListener("click", (event) => {
      if (event.target.tagName === "TD") {
        var clickedRow = event.target.parentElement;

        if (selectedRow && selectedRow !== clickedRow) {
          selectedRow.classList.remove("table-click-row");
        }

        if (selectedRow !== clickedRow) {
          clickedRow.classList.add("table-click-row");
          selectedRow = clickedRow;
        } else {
          clickedRow.classList.remove("table-click-row");
          selectedRow = null;
        }
      } else {
      }
    });
  }

  static onmouseover(selector) {
    const table = q(selector);
    if (!table) {
      console.warn(`Tabela com ID "${selector}" não encontrada.`);
      return;
    }

    table.addEventListener("mouseover", (event) => {
      if (event.target.tagName === "TD") {
        event.target.parentElement.classList.add("table-hover-row");
      }
    });

    table.addEventListener("mouseout", (event) => {
      if (event.target.tagName === "TD") {
        event.target.parentElement.classList.remove("table-hover-row");
      }
    });
  }
}

export class Style {
  static colorStatus(item) {
    const colors = {
      ATRASADO: "color: rgb(255, 0, 0)",
      INICIADO: "color: rgb(194, 184, 6)",
      "A VENCER": "color: rgb(226, 109, 0)",
      PENDENCIA: "color: rgb(186, 2, 227)",
      URGENTE: "color: rgb(59, 186, 255)",
      PRONTO: "color: rgb(81, 154, 2)",
      ENTREGUE: "color: rgb(93, 90, 245)",
      PARCEADO: "color: rgb(2, 188, 188)",
    };
    return colors[item] || "";
  }

  static setColorBool(int) {
    if (int > 0) {
      return "color: rgb(194, 184, 6)";
    } else {
      return "color: rgb(70, 136, 0)";
    }
  }

  static checkPrevisao(firtItem, secondItem) {
    if (firtItem != secondItem) {
      return "color: rgba(242, 164, 38, 1)";
    }
  }
}
